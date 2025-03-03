import { CreateSwapOrderDto, SwapOrderResponseDto, BatchedSwapOrderResponseDto } from "src/modules/order/dtos/swap-order.dto";
import { CreateTransferOrderDto, TransferOrderResponseDto, CreateBatchedTransferDto, CreateBatchedTransferMultiSendersDto, QueryTransferOrderDto } from "src/modules/order/dtos/transfer-order.dto";
import { CreateWithdrawalOrderDto, WithdrawalOrderResponseDto } from "src/modules/order/dtos/withdrawal-order.dto";
import { IWalletService } from "../../wallet/IWalletService";
import { CreateBaseOrderDto } from "src/modules/order/dtos/base-order.dto";
import { JsonRpcProvider, parseUnits, TransactionRequest, Wallet } from "ethers";
import { NetworkConfigs } from "src/libs/web3/provider";
import { BaseOrderService } from "./BaseOrderService";
import { Repository } from "typeorm";
import { TransferOrder } from "src/modules/order/entities/transfer-order.entity";
import { WithdrawalOrder } from "src/modules/order/entities/withdrawal-order.entity";
import { SwapOrder } from "src/modules/order/entities/swap-order.entity";
import { ERC20__factory } from "src/contracts";
import { TokenService } from "src/modules/token/TokenService";
import { BadRequestException } from "@nestjs/common";

export abstract class BaseEVMOrderService extends BaseOrderService {

    provider: JsonRpcProvider

    constructor(
        readonly chain: string,
        transferRepo: Repository<TransferOrder>,
        withdrawalRepo: Repository<WithdrawalOrder>,
        swapRepo: Repository<SwapOrder>,
        tokenService: TokenService,
        walletService: IWalletService) {
        super(chain, transferRepo, withdrawalRepo, swapRepo, tokenService, walletService);
        this.provider = new JsonRpcProvider(NetworkConfigs[this.chain].rpc);
    }

    async getSrcWallet(params: CreateBaseOrderDto) {
        const walletDto = await this.walletService.assertWalletForExecution({
            address: params.account,
            chain: params.chain
        });
        return new Wallet(walletDto.privateKey, this.provider);
    }

    async estimateERC20TransferGas(wallet: Wallet, token: string) {
        const txData = ERC20__factory.createInterface().encodeFunctionData(
            "transfer",
            [token, BigInt(1)]
        );
        const tx: TransactionRequest = {
            from: wallet.address,
            to: token,
            data: txData,
            value: '0x0',
            chainId: NetworkConfigs[this.chain].chainId,
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
        const txData = ERC20__factory.createInterface().encodeFunctionData(
            "transfer",
            [recipient, amount]
        );
        const tx: TransactionRequest = {
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

        const signedTx = await wallet.signTransaction(tx);

        const res = await wallet.provider!.broadcastTransaction(signedTx);

        return res.hash;
    }

    executeSwap(params: CreateSwapOrderDto): Promise<SwapOrderResponseDto> {
        throw new Error("Method not implemented.");
    }
    executeSwapsInBatch(params: CreateSwapOrderDto[]): Promise<BatchedSwapOrderResponseDto> {
        throw new Error("Method not implemented.");
    }
    async transfer(params: CreateTransferOrderDto): Promise<TransferOrderResponseDto> {
        await this.walletService.assertKnownAccount({
            address: params.recipient,
            chain: params.chain
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
            throw new BadRequestException(`Failed to execute order: ${(err as Error).message}`)
        }
    }
    async transferInBatch(params: CreateBatchedTransferDto): Promise<TransferOrderResponseDto[]> {
        const creationDtos: CreateBaseOrderDto[] = [];
        const recipients = await this.walletService.assertKnownAccounts(params.recipients);
        const wallet = await this.getSrcWallet(params);
        let curNonce = await wallet.getNonce();
        const gasLimit = await this.estimateERC20TransferGas(wallet, params.token);
        const feeData = await this.provider.getFeeData();
        const gasPrice = feeData.gasPrice;
        for (let i = 0; i < params.amounts.length; i++) {
            const amount = parseUnits(params.amounts[i]);
            const recipient = recipients[i];
            try {
                const hash = await this.fastTransferToken(
                    wallet,
                    curNonce++,
                    params.token,
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
            }

            const records = this.transferRepo.create(creationDtos);
            return await this.transferRepo.save(records);
        }
    }
    async transferInBatchMultiSenders(params: CreateBatchedTransferMultiSendersDto): Promise<TransferOrderResponseDto[]> {
        const walletDtos = await this.walletService.assertWalletsForExecution(params.senders);
        const wallets = walletDtos.map(w => new Wallet(w.privateKey, this.provider));
        const token = await this.tokenService.assertKnownToken({ address: params.token, chain: params.chain });
        const recipient = await this.walletService.assertKnownAccount({ address: params.recipient, chain: params.chain });
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

}