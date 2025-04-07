import { CreateTransferOrderDto, TransferOrderResponseDto, CreateBatchedTransferDto, CreateBatchedTransferMultiSendersDto } from "src/modules/order/dtos/transfer-order.dto";
import { CreateWithdrawalOrderDto, WithdrawalOrderResponseDto } from "src/modules/order/dtos/withdrawal-order.dto";
import { CreateBaseOrderDto } from "src/modules/order/dtos/base-order.dto";
import { JsonRpcProvider, parseUnits, Wallet } from "ethers";
import { NetworkConfigs } from "src/libs/consts";
import { Repository } from "typeorm";
import { TransferOrder } from "src/modules/order/entities/transfer-order.entity";
import { WithdrawalOrder } from "src/modules/order/entities/withdrawal-order.entity";
import { SwapOrder } from "src/modules/order/entities/swap-order.entity";
import { TokenService } from "src/modules/token/token.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { PairService } from "src/modules/pair/pair.service";
import { CreateBatchedSwapOrderDto, CreateSwapOrderDto, SwapOrderResponseDto } from "src/modules/order/dtos/swap-order.dto";
import { PairResponseDto } from "src/modules/pair/pair-dto";
import { BaseOrderService } from "../BaseOrderService";
import { IWalletService } from "src/libs/services/wallet/IWalletService";
import { Web3Helper } from "src/libs/services/web3";
import { ITronVMSwapper } from "../../ITronVMSwapper";
import { TronVMTokenHelper } from "src/libs/tron/token-helper";
import { SunswapV2Swapper } from "./SunswapV2Swapper";

export class TronOrderService extends BaseOrderService {

    provider: JsonRpcProvider

    constructor(
        transferRepo: Repository<TransferOrder>,
        withdrawalRepo: Repository<WithdrawalOrder>,
        swapRepo: Repository<SwapOrder>,
        tokenService: TokenService,
        pairService: PairService,
        walletService: IWalletService
    ) {
        super("tron", transferRepo, withdrawalRepo, swapRepo, tokenService, pairService, walletService);
        this.provider = new JsonRpcProvider(NetworkConfigs[this.chain].rpc);
    }

    async getSrcWallet(params: CreateBaseOrderDto) {
        const walletDto = await this.walletService.assertWalletForExecution({
            address: params.account,
        });
        return walletDto
    }

    async transfer(params: CreateTransferOrderDto): Promise<TransferOrderResponseDto> {
        await this.walletService.assertKnownAccount({
            address: params.recipient,
        });
        const senderWallet = await this.getSrcWallet(params);
        const token = await this.tokenService.assertKnownToken({ address: params.token, chain: params.chain });

        try {
            const tx = await TronVMTokenHelper.transferToken(senderWallet.privateKey, token.address, params.recipient, parseUnits(params.amount, token.decimals));
            const record = this.transferRepo.create({
                ...params,
                txHash: tx,
            });

            return await this.transferRepo.save(record);
        } catch (err) {
            console.log(err);
            throw new BadRequestException(`Failed to execute order: ${(err as Error).message}`)
        }
    }
    async transferInBatch(params: CreateBatchedTransferDto): Promise<TransferOrderResponseDto[]> {
        const creationDtos: CreateBaseOrderDto[] = [];
        const recipients = await this.walletService.assertKnownAccounts(params.recipients);
        const token = await this.tokenService.assertKnownToken({
            address: params.token,
            chain: params.chain
        });
        const wallet = await this.getSrcWallet(params);

        for (let i = 0; i < params.amounts.length; i++) {
            const amount = parseUnits(params.amounts[i], token.decimals);
            const recipient = recipients[i];
            try {
                const tx = await TronVMTokenHelper.transferToken(wallet.privateKey, token.address, recipient, amount);
                const transferCreationDto: CreateTransferOrderDto = {
                    token: params.token,
                    recipient,
                    amount: params.amounts[i],
                    username: params.username,
                    chain: params.chain,
                    account: params.account,
                    txHash: tx
                }

                creationDtos.push(transferCreationDto);
            } catch (err) {
                console.log(err);
            }
        }
        const records = this.transferRepo.create(creationDtos);
        return await this.transferRepo.save(records);
    }
    async transferInBatchMultiSenders(params: CreateBatchedTransferMultiSendersDto): Promise<TransferOrderResponseDto[]> {
        const walletDtos = await this.walletService.assertWalletsForExecution(params.senders);
        const wallets = walletDtos.map(w => new Wallet(w.privateKey, this.provider));
        const token = await this.tokenService.assertKnownToken({ address: params.token, chain: params.chain });
        const recipient = await this.walletService.assertKnownAccount({ address: params.recipient });
        const creationDtos = await Promise.all(
            wallets.map(async (wallet, idx) => {
                try {

                    const amount = parseUnits(params.amounts[idx], token.decimals);
                    const tx = await TronVMTokenHelper.transferToken(wallet.privateKey, token.address, params.recipient, amount);

                    const creationDto: CreateTransferOrderDto = {
                        token: token.address,
                        recipient,
                        amount: params.amounts[idx],
                        username: params.username,
                        chain: params.chain,
                        account: wallet.address,
                        txHash: tx
                    }

                    return creationDto;
                } catch (err) {
                    return undefined;
                }
            })
        );

        const nonNullDtos = creationDtos.filter(d => d !== undefined);
        const records = this.transferRepo.create(nonNullDtos);
        return await this.transferRepo.save(records);
    }
    async withdraw(params: CreateWithdrawalOrderDto): Promise<WithdrawalOrderResponseDto> {
        const senderWallet = await this.getSrcWallet(params);
        const token = await this.tokenService.assertKnownToken({ address: params.token, chain: params.chain });

        try {
            const tx = await TronVMTokenHelper.transferToken(senderWallet.privateKey, token.address, params.recipient, parseUnits(params.amount, token.decimals));
            const record = this.withdrawalRepo.create({
                ...params,
                txHash: tx
            });

            return await this.withdrawalRepo.save(record);
        } catch (err) {
            throw new BadRequestException(`Failed to execute order: ${(err as Error).message}`)
        }
    }

    getSwapper(protocol: string): ITronVMSwapper {
        switch (protocol) {
            case "sunswap-v2": {
                return new SunswapV2Swapper();
            }

            default: {
                throw new NotFoundException("Protocol is not supported");
            }
        }
    }
    async executeSwap(params: CreateSwapOrderDto): Promise<SwapOrderResponseDto> {
        const tokenIn = await this.tokenService.assertKnownToken({ address: params.tokenIn, chain: this.chain });
        const tokenOut = await this.tokenService.assertKnownToken({ address: params.tokenOut, chain: this.chain });
        const recipient = await this.walletService.assertKnownAccount({
            address: params.recipient
        })

        let pair: PairResponseDto;
        try {
            const [token0, token1] = (tokenIn.address).toLowerCase() < (tokenOut.address).toLowerCase() ? [tokenIn.address, tokenOut.address] : [tokenOut.address, tokenIn.address];
            pair = await this.pairService.assertKnownPair({
                protocol: params.protocol, chain: params.chain,
                token0, token1
            })
        } catch (err) {
            let token0 = Web3Helper.getERC20Representation(params.chain, tokenIn.address);
            let token1 = Web3Helper.getERC20Representation(params.chain, tokenOut.address);
            [token0, token1] = (token0).toLowerCase() < (token1).toLowerCase() ? [token0, token1] : [token1, token0];
            pair = await this.pairService.assertKnownPair({
                protocol: params.protocol, chain: params.chain,
                token0: Web3Helper.getERC20Representation(params.chain, token0),
                token1: Web3Helper.getERC20Representation(params.chain, token1)
            })
        }
        const wallet = await this.getSrcWallet(params);

        const swapper = this.getSwapper(params.protocol);

        try {
            const txHash = await swapper.executeSwap(
                wallet.privateKey,
                params.tokenIn,
                params.tokenOut,
                parseUnits(params.amountIn, tokenIn.decimals),
                parseUnits(params.amountOutMin, tokenOut.decimals),
                recipient,
                BigInt(pair.fee),
                pair.pair
            );

            const creationDto: CreateSwapOrderDto = {
                ...params,
                txHash
            }

            return await this.swapRepo.save(this.swapRepo.create(creationDto));
        } catch (err) {
            console.log(err);
            throw new BadRequestException(`Failed to execute order: ${(err as Error).message}`)
        }
    }
    async executeSwapsInBatch(params: CreateBatchedSwapOrderDto): Promise<SwapOrderResponseDto[]> {
        const tokenIn = await this.tokenService.assertKnownToken({ address: params.tokenIn, chain: this.chain });
        const tokenOut = await this.tokenService.assertKnownToken({ address: params.tokenOut, chain: this.chain });
        const recipients = await this.walletService.assertKnownAccounts({
            accounts: params.items.map(o => o.recipient)
        });

        const [token0, token1] = (tokenIn.address).toLowerCase() < (tokenOut.address).toLowerCase() ? [tokenIn.address, tokenOut.address] : [tokenOut.address, tokenIn.address];
        const pair = await this.pairService.assertKnownPair({
            protocol: params.protocol, chain: params.chain,
            token0, token1
        })
        const wallets = await this.walletService.assertWalletsForExecution({
            accounts: params.items.map(o => o.account)
        })
        const feeData = await this.provider.getFeeData();
        const gasPrice = feeData.gasPrice;
        const swapper = this.getSwapper(params.protocol);
        const signedTxs = await Promise.all(wallets.map(async (wallet, idx) => {
            const recipient = recipients[idx];
            const amountIn = parseUnits(params.items[idx].amountIn, tokenIn.decimals);
            const amountOutMin = parseUnits(params.items[idx].amountOutMin, tokenIn.decimals);

            return await swapper.prepareForSwap(
                wallet.privateKey,
                tokenIn.address,
                tokenOut.address,
                amountIn,
                amountOutMin,
                gasPrice,
                recipient,
                BigInt(pair.fee),
                pair.pair
            );
        }));

        const responses = await Promise.all(signedTxs.map(tx => this.provider.broadcastTransaction(tx)));
        const txHashes = responses.map(res => res.hash);
        const creationDtos: CreateSwapOrderDto[] = txHashes.map((txHash, idx) => {
            const dto: CreateSwapOrderDto = {
                txHash,
                tokenIn: params.tokenIn,
                tokenOut: params.tokenOut,
                recipient: params.items[idx].recipient,
                protocol: params.protocol,
                amountIn: params.items[idx].amountIn,
                amountOutMin: params.items[idx].amountOutMin,
                username: params.username,
                chain: params.chain,
                account: params.items[idx].account
            }

            return dto;
        })

        return await this.swapRepo.save(this.swapRepo.create(creationDtos));
    }
}