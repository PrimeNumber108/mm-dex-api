import { CreateSwapOrderDto, SwapOrderResponseDto, QuerySwapOrderDto } from "src/modules/order/dtos/swap-order.dto";
import { CreateTransferOrderDto, TransferOrderResponseDto, CreateBatchedTransferDto, CreateBatchedTransferMultiSendersDto, QueryTransferOrderDto } from "src/modules/order/dtos/transfer-order.dto";
import { CreateWithdrawalOrderDto, WithdrawalOrderResponseDto, QueryWithdrawalOrderDto } from "src/modules/order/dtos/withdrawal-order.dto";
import { IOrderService } from "../IOrderService";
import { Repository, SelectQueryBuilder } from "typeorm";
import { TransferOrder } from "src/modules/order/entities/transfer-order.entity";
import { WithdrawalOrder } from "src/modules/order/entities/withdrawal-order.entity";
import { SwapOrder } from "src/modules/order/entities/swap-order.entity";
import { TokenService } from "src/modules/token/token.service";
import { IWalletService } from "../../wallet/IWalletService";
import { PollOrderDto, BaseOrderWithTagResponseDto, BaseOrderResponseDto } from "src/modules/order/dtos/base-order.dto";
import { BaseOrder } from "src/modules/order/entities/base-order";

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

    timeRangeQuery(queryBuilder: SelectQueryBuilder<BaseOrder>, fromTs?: number, toTs?: number){
        if(fromTs){
            queryBuilder.andWhere("order.executionTime >= :fromTs", {fromTs});
        }
        if(toTs){
            queryBuilder.andWhere("order.executionTime < :toTs", {toTs});
        }
    }
    async poll(params: PollOrderDto): Promise<BaseOrderWithTagResponseDto[]> {
        const {
            tag, ...baseQuery
        } = params;

        let transfers: BaseOrderWithTagResponseDto[] = [];
        let withdrawals: BaseOrderWithTagResponseDto[] = [];
        let swaps: BaseOrderWithTagResponseDto[] = [];

        if(!tag || tag === 'transfer'){
            transfers = (await this.queryTransfers(baseQuery)).map(order => ({...order, tag: 'transfer'}));
        }
        if(!tag || tag === 'withdrawal'){
            withdrawals = (await this.queryWithdrawals(baseQuery)).map(order => ({...order, tag: 'withdraw'}));
        }
        if(!tag || tag === 'swap'){
            swaps = (await this.querySwaps(baseQuery)).map(order => ({...order, tag: 'swap'}));
        }

        return [
            ...transfers,
            ...withdrawals,
            ...swaps
        ]
    }

    executeSwap(params: CreateSwapOrderDto): Promise<SwapOrderResponseDto> {
        throw new Error("Method not implemented.");
    }
    executeSwapsInBatch(params: CreateSwapOrderDto[]): Promise<SwapOrderResponseDto[]> {
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
        const {
            fromTs,
            toTs,
            ...rest
        } = params;
        const queryBuilder = this.transferRepo.createQueryBuilder("order");
        queryBuilder.where(rest);
        this.timeRangeQuery(queryBuilder);
        return await queryBuilder.getMany();
    }
    async queryWithdrawals(params: QueryWithdrawalOrderDto): Promise<WithdrawalOrderResponseDto[]> {
        const {
            fromTs,
            toTs,
            ...rest
        } = params;
        const queryBuilder = this.withdrawalRepo.createQueryBuilder("order");
        queryBuilder.where(rest);
        this.timeRangeQuery(queryBuilder);
        return await queryBuilder.getMany();
    }
    async querySwaps(params: QuerySwapOrderDto): Promise<SwapOrderResponseDto[]> {
        const {
            fromTs,
            toTs,
            ...rest
        } = params;
        const queryBuilder = this.swapRepo.createQueryBuilder("order");
        queryBuilder.where(rest);
        this.timeRangeQuery(queryBuilder);
        return await queryBuilder.getMany();
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