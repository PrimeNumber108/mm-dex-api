import { BatchedSwapOrderResponseDto, CreateSwapOrderDto, QuerySwapOrderDto, SwapOrderResponseDto } from "src/modules/order/dtos/swap-order.dto";
import { CreateDistributionDto, CreateGatheringDto, CreateTransferOrderDto, QueryTransferOrderDto, TransferOrderRequestDto, TransferOrderResponseDto } from "src/modules/order/dtos/transfer-order.dto";
import { CreateWithdrawalOrderDto, QueryWithdrawalOrderDto, WithdrawalOrderResponseDto } from "src/modules/order/dtos/withdrawal-order.dto";

export interface IOrderService {
    readonly chain: string;

    executeSwap(
        params: CreateSwapOrderDto
    ): Promise<SwapOrderResponseDto>;

    executeSwapsInBatch(params: CreateSwapOrderDto[]): Promise<BatchedSwapOrderResponseDto>;

    transfer(params: CreateTransferOrderDto): Promise<TransferOrderResponseDto>;

    withdraw(params: CreateWithdrawalOrderDto): Promise<WithdrawalOrderResponseDto>;

    distribute(
        params: CreateDistributionDto
    ): Promise<TransferOrderResponseDto[]>;

    gather(
        params: CreateGatheringDto
    ): Promise<TransferOrderResponseDto[]>;

    queryTransfers(
        params: QueryTransferOrderDto
    ): Promise<TransferOrderResponseDto[]>;

    queryWithdrawals(
        params: QueryWithdrawalOrderDto
    ): Promise<WithdrawalOrderResponseDto[]>;

    querySwaps(
        params: QuerySwapOrderDto
    ): Promise<SwapOrderResponseDto[]>;
}