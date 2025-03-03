import { CreateSwapOrderDto, QuerySwapOrderDto, SwapOrderResponseDto } from "src/modules/order/dtos/swap-order.dto";
import { CreateBatchedTransferDto, CreateBatchedTransferMultiSendersDto, CreateTransferOrderDto, QueryTransferOrderDto, TransferOrderResponseDto } from "src/modules/order/dtos/transfer-order.dto";
import { CreateWithdrawalOrderDto, QueryWithdrawalOrderDto, WithdrawalOrderResponseDto } from "src/modules/order/dtos/withdrawal-order.dto";

export interface IOrderService {
    readonly chain: string;

    executeSwap(
        params: CreateSwapOrderDto
    ): Promise<SwapOrderResponseDto>;

    executeSwapsInBatch(params: CreateSwapOrderDto[]): Promise<SwapOrderResponseDto[]>;

    transfer(params: CreateTransferOrderDto): Promise<TransferOrderResponseDto>;
    transferInBatch(params: CreateBatchedTransferDto): Promise<TransferOrderResponseDto[]>;
    transferInBatchMultiSenders(params: CreateBatchedTransferMultiSendersDto): Promise<TransferOrderResponseDto[]>;

    withdraw(params: CreateWithdrawalOrderDto): Promise<WithdrawalOrderResponseDto>;

    queryTransfers(
        params: QueryTransferOrderDto
    ): Promise<TransferOrderResponseDto[]>;

    queryWithdrawals(
        params: QueryWithdrawalOrderDto
    ): Promise<WithdrawalOrderResponseDto[]>;

    querySwaps(
        params: QuerySwapOrderDto
    ): Promise<SwapOrderResponseDto[]>;

    recordTransfers(
        params: CreateTransferOrderDto[]
    ): Promise<TransferOrderResponseDto[]>;

    recordSwaps(
        params: CreateSwapOrderDto[]
    ): Promise<SwapOrderResponseDto[]>;

    recordWithdrawals(
        params: CreateWithdrawalOrderDto[]
    ): Promise<WithdrawalOrderResponseDto[]>;
}