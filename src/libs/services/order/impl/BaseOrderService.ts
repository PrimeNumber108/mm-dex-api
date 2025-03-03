import { CreateSwapOrderDto, SwapOrderResponseDto, BatchedSwapOrderResponseDto, QuerySwapOrderDto } from "src/modules/order/dtos/swap-order.dto";
import { CreateTransferOrderDto, TransferOrderResponseDto, CreateBatchedTransferDto, CreateBatchedTransferMultiSendersDto, QueryTransferOrderDto } from "src/modules/order/dtos/transfer-order.dto";
import { CreateWithdrawalOrderDto, WithdrawalOrderResponseDto, QueryWithdrawalOrderDto } from "src/modules/order/dtos/withdrawal-order.dto";
import { IOrderService } from "../IOrderService";
import { Repository } from "typeorm";
import { TransferOrder } from "src/modules/order/entities/transfer-order.entity";
import { WithdrawalOrder } from "src/modules/order/entities/withdrawal-order.entity";
import { SwapOrder } from "src/modules/order/entities/swap-order.entity";
import { TokenService } from "src/modules/token/TokenService";
import { QueryWalletDto } from "src/modules/wallet/dtos/query-wallet.dto";
import { IWalletService } from "../../wallet/IWalletService";

export abstract class BaseOrderService implements IOrderService {
    constructor(
        public readonly chain: string,
        protected readonly transferRepo: Repository<TransferOrder>,
        protected readonly withdrawalRepo: Repository<WithdrawalOrder>,
        protected readonly swapRepo: Repository<SwapOrder>,
        protected readonly tokenService: TokenService,
        protected readonly walletService: IWalletService
    ){

    }

    executeSwap(params: CreateSwapOrderDto): Promise<SwapOrderResponseDto> {
        throw new Error("Method not implemented.");
    }
    executeSwapsInBatch(params: CreateSwapOrderDto[]): Promise<BatchedSwapOrderResponseDto> {
        throw new Error("Method not implemented.");
    }
    transfer(params: CreateTransferOrderDto): Promise<TransferOrderResponseDto> {
        throw new Error("Method not implemented.");
    }
    transferInBatch(params: CreateBatchedTransferDto): Promise<TransferOrderResponseDto[]> {
        throw new Error("Method not implemented.");
    }
    transferInBatchMultiSenders(params: CreateBatchedTransferMultiSendersDto): Promise<TransferOrderResponseDto[]> {
        throw new Error("Method not implemented.");
    }
    withdraw(params: CreateWithdrawalOrderDto): Promise<WithdrawalOrderResponseDto> {
        throw new Error("Method not implemented.");
    }
    async queryTransfers(params: QueryTransferOrderDto): Promise<TransferOrderResponseDto[]> {
        throw new Error("Method not implemented.");
    }
    async queryWithdrawals(params: QueryWithdrawalOrderDto): Promise<WithdrawalOrderResponseDto[]> {
        throw new Error("Method not implemented.");
    }
    async querySwaps(params: QuerySwapOrderDto): Promise<SwapOrderResponseDto[]> {
        throw new Error("Method not implemented.");
    }
    async recordTransfers(params: CreateTransferOrderDto[]): Promise<TransferOrderResponseDto[]> {
        const records = this.transferRepo.create(params);
        return await this.transferRepo.save(records);
    }
    async recordSwaps(params: CreateSwapOrderDto[]): Promise<SwapOrderResponseDto[]> {
        const records = this.swapRepo.create(params);
        return await this.swapRepo.save(records);
    }
    async recordWithdrawals(params: CreateWithdrawalOrderDto[]): Promise<WithdrawalOrderResponseDto[]> {
        const records = this.withdrawalRepo.create(params);
        return await this.withdrawalRepo.save(records);
    }
    
}