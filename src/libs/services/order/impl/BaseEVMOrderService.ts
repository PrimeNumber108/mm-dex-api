import { CreateTransferOrderDto, TransferOrderResponseDto, CreateBatchedTransferDto, CreateBatchedTransferMultiSendersDto, QueryTransferOrderDto } from "src/modules/order/dtos/transfer-order.dto";
import { CreateWithdrawalOrderDto, WithdrawalOrderResponseDto } from "src/modules/order/dtos/withdrawal-order.dto";
import { IWalletService } from "../../wallet/IWalletService";
import { CreateBaseOrderDto } from "src/modules/order/dtos/base-order.dto";
import { JsonRpcProvider, parseEther, parseUnits, TransactionRequest, Wallet } from "ethers";
import { NATIVE, NetworkConfigs } from "src/libs/consts";
import { BaseOrderService } from "./BaseOrderService";
import { Repository } from "typeorm";
import { TransferOrder } from "src/modules/order/entities/transfer-order.entity";
import { WithdrawalOrder } from "src/modules/order/entities/withdrawal-order.entity";
import { SwapOrder } from "src/modules/order/entities/swap-order.entity";
import { ERC20__factory } from "src/contracts/factories";
import { TokenService } from "src/modules/token/token.service";
import { BadRequestException } from "@nestjs/common";
import { PairService } from "src/modules/pair/pair.service";
import { CreateBatchedSwapOrderDto, CreateSwapOrderDto, SwapOrderResponseDto } from "src/modules/order/dtos/swap-order.dto";
import { IEVMSwapper } from "../IEVMSwapper";
import { PairResponseDto } from "src/modules/pair/pair-dto";
import { Web3Helper } from "../../web3";

export abstract class BaseEVMOrderService extends BaseOrderService {

    provider: JsonRpcProvider

    constructor(
        readonly chain: string,
        transferRepo: Repository<TransferOrder>,
        withdrawalRepo: Repository<WithdrawalOrder>,
        swapRepo: Repository<SwapOrder>,
        tokenService: TokenService,
        pairService: PairService,
        walletService: IWalletService
    ) {
        super(chain, transferRepo, withdrawalRepo, swapRepo, tokenService, pairService, walletService);
        this.provider = new JsonRpcProvider(NetworkConfigs[this.chain].rpc);
    }


    async getSrcWallet(params: CreateBaseOrderDto) {
        const walletDto = await this.walletService.assertWalletForExecution({
            address: params.account,
        });
        return new Wallet(walletDto.privateKey, this.provider);
    }


    async estimateTransferGas(wallet: Wallet, token: string) {
        let tx: TransactionRequest;
        if (token === NATIVE) {
            tx = {
                from: wallet.address,
                to: '0x267f2A39989dD184E010BF2Ac970df0297b686a7',
                value: parseEther('0.000000000000001'),
                chainId: NetworkConfigs[this.chain].chainId,
            }
        } else {
            const txData = ERC20__factory.createInterface().encodeFunctionData(
                "transfer",
                [token, BigInt(1)]
            );
            tx = {
                from: wallet.address,
                to: token,
                data: txData,
                value: '0x0',
                chainId: NetworkConfigs[this.chain].chainId,
            }
        }
        return await wallet.estimateGas(tx);
    }
    async fastTransferToken(
        wallet: Wallet,
        nonce: number,
        token: string,
        amount: bigint,
        recipient: string,
        gasLimit: bigint,
        gasPrice: bigint,
    ) {
        let tx: TransactionRequest;

        if (token === NATIVE) {
            tx = {
                from: wallet.address,
                to: recipient,
                value: amount,
                chainId: NetworkConfigs[this.chain].chainId,
                nonce,
                gasLimit,
                gasPrice,
                type: 0
            }
        }
        else {
            const txData = ERC20__factory.createInterface().encodeFunctionData(
                "transfer",
                [recipient, amount]
            );
            tx = {
                from: wallet.address,
                to: token,
                data: txData,
                value: '0x0',
                chainId: NetworkConfigs[this.chain].chainId,
                nonce,
                gasLimit,
                gasPrice,
                type: 0
            }
        }

        const signedTx = await wallet.signTransaction(tx);

        const res = await wallet.provider!.broadcastTransaction(signedTx);

        return res.hash;
    }

    async transfer(params: CreateTransferOrderDto): Promise<TransferOrderResponseDto> {
        await this.walletService.assertKnownAccount({
            address: params.recipient,
        });
        const senderWallet = await this.getSrcWallet(params);
        const token = await this.tokenService.assertKnownToken({ address: params.token, chain: params.chain });

        const sc = ERC20__factory.connect(params.token, senderWallet);
        try {
            const tx = await sc.transfer(params.recipient, parseUnits(params.amount, token.decimals));
            await tx.wait();
            const record = this.transferRepo.create({
                ...params,
                txHash: tx.hash,
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
        let curNonce = await wallet.getNonce();
        const gasLimit = await this.estimateTransferGas(wallet, token.address);
        const feeData = await this.provider.getFeeData();
        const gasPrice = feeData.gasPrice;
        for (let i = 0; i < params.amounts.length; i++) {
            const amount = parseUnits(params.amounts[i], token.decimals);
            const recipient = recipients[i];
            try {
                const hash = await this.fastTransferToken(
                    wallet,
                    curNonce++,
                    token.address,
                    amount,
                    recipient,
                    gasLimit,
                    gasPrice
                )
                const transferCreationDto: CreateTransferOrderDto = {
                    token: params.token,
                    recipient,
                    amount: params.amounts[i],
                    username: params.username,
                    chain: params.chain,
                    account: params.account,
                    txHash: hash
                }

                creationDtos.push(transferCreationDto);
            } catch (err) {
                console.log(err);
                curNonce = curNonce - 1;
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
                    const sc = ERC20__factory.connect(token.address, wallet);

                    const amount = parseUnits(params.amounts[idx], token.decimals);
                    const tx = await sc.transfer(recipient, amount);
                    await tx.wait();

                    const creationDto: CreateTransferOrderDto = {
                        token: token.address,
                        recipient,
                        amount: params.amounts[idx],
                        username: params.username,
                        chain: params.chain,
                        account: wallet.address,
                        txHash: tx.hash
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
        const sc = ERC20__factory.connect(params.token, senderWallet);
        try {
            const tx = await sc.transfer(params.recipient, parseUnits(params.amount, token.decimals));
            await tx.wait();
            const record = this.withdrawalRepo.create({
                ...params,
                txHash: tx.hash,
            });

            return await this.withdrawalRepo.save(record);
        } catch (err) {
            throw new BadRequestException(`Failed to execute order: ${(err as Error).message}`)
        }
    }

    getSwapper(protocol: string): IEVMSwapper {
        throw new Error("Method not implemented!");
    }
    async executeSwap(params: CreateSwapOrderDto): Promise<SwapOrderResponseDto> {
        const tokenIn = await this.tokenService.assertKnownToken({ address: params.tokenIn, chain: this.chain });
        const tokenOut = await this.tokenService.assertKnownToken({ address: params.tokenOut, chain: this.chain });
        const recipient = await this.walletService.assertKnownAccount({
            address: params.account
        })

        const [token0, token1] = BigInt(tokenIn.address) < BigInt(tokenOut.address) ? [tokenIn.address, tokenOut.address] : [tokenOut.address, tokenIn.address];
        let pair: PairResponseDto;
        try {
            //Get from checked DB
            const [token0, token1] = BigInt(tokenIn.address) < BigInt(tokenOut.address) ? [tokenIn.address, tokenOut.address] : [tokenOut.address, tokenIn.address];
            pair = await this.pairService.assertKnownPair({
                protocol: params.protocol, chain: params.chain,
                token0, token1
            })
        } catch (err) {
            //Get Raw input Token
            let token0 = Web3Helper.getERC20Representation(params.chain, tokenIn.address);
            let token1 = Web3Helper.getERC20Representation(params.chain, tokenOut.address);
            [token0, token1] = BigInt(token0) < BigInt(token1) ? [token0, token1] : [token1, token0];
            pair = await this.pairService.assertKnownPair({
                protocol: params.protocol, chain: params.chain,
                token0: Web3Helper.getERC20Representation(params.chain, token0),
                token1: Web3Helper.getERC20Representation(params.chain, token1)
            })
        }
        const wallet = await this.getSrcWallet(params);
        const swapper = this.getSwapper(params.protocol);

        try {
            // const txHash = await swapper.executeSwap(
            //     wallet,
            //     params.tokenIn  = params.orderSide.toUpperCase() == 'BUY'?  params.tokenIn :params.tokenOut,
            //     params.tokenOut = params.orderSide.toUpperCase() == 'BUY'? params.tokenOut: params.tokenIn,
            //     parseUnits(params.amountIn, tokenIn.decimals),
            //     parseUnits(params.amountOutMin, tokenOut.decimals = params.orderSide.toUpperCase() == 'BUY'?  tokenIn.decimals :tokenOut.decimals),
            //     recipient,
            //     BigInt(pair.fee),
            //     pair.pair
            // );
            const txHash = await swapper.executeSwap(
                wallet,
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
        const [token0, token1] = BigInt(tokenIn.address) < BigInt(tokenOut.address) ? [tokenIn.address, tokenOut.address] : [tokenOut.address, tokenIn.address];
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
                new Wallet(wallet.privateKey, this.provider),
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
                // orderSide: params.orderSide,
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