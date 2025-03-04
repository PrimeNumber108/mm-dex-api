import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderServiceFactory } from "src/libs/services/order/OrderServiceFactory";
import { TransferOrder } from "./entities/transfer-order.entity";
import { Repository } from "typeorm";
import { SwapOrder } from "./entities/swap-order.entity";
import { WithdrawalOrder } from "./entities/withdrawal-order.entity";
import { TokenService } from "../token/token.service";
import { WalletServiceFactory } from "src/libs/services/wallet/WalletServiceFactory";
import { Wallet } from "../wallet/wallet.entity";
import { CreateBatchedSwapOrderDto, CreateSwapOrderDto, QuerySwapOrderDto, SwapOrderResponseDto } from "./dtos/swap-order.dto";
import { CreateBatchedTransferDto, CreateBatchedTransferMultiSendersDto, CreateTransferOrderDto, QueryTransferOrderDto, TransferOrderResponseDto } from "./dtos/transfer-order.dto";
import { CreateWithdrawalOrderDto, QueryWithdrawalOrderDto, WithdrawalOrderResponseDto } from "./dtos/withdrawal-order.dto";
import { BaseOrderWithTagResponseDto, QueryBaseOrderDto } from "./dtos/base-order.dto";
import { PairService } from "../pair/pair.service";
import { FillUsername } from "src/decorators/fill-username.decorator";

@ApiTags('Order')
@ApiSecurity('x-api-secret') // Ensure Swagger includes x-api-secret
@ApiSecurity('username') // Ensure Swagger includes username
@Controller('order')
export class OrderController {
    private readonly factory: OrderServiceFactory;
    constructor(
        @InjectRepository(TransferOrder)
        transferRepo: Repository<TransferOrder>,
        @InjectRepository(WithdrawalOrder)
        withdrawalRepo: Repository<WithdrawalOrder>,
        @InjectRepository(SwapOrder)
        swapRepo: Repository<SwapOrder>,
        @InjectRepository(Wallet)
        walletRepo: Repository<Wallet>,
        tokenService: TokenService,
        pairService: PairService,
    ) {
        const walletService = new WalletServiceFactory(walletRepo).getWalletService("berachain");
        this.factory = new OrderServiceFactory(transferRepo, withdrawalRepo, swapRepo, tokenService, pairService, walletService);
    }

    @Post('/swap')
    @FillUsername()
    @ApiResponse({
        status: 201,
        type: SwapOrderResponseDto,
        description: 'Swap order'
    })
    async executeSwap(@Body() params: CreateSwapOrderDto): Promise<SwapOrderResponseDto> {
        const service = this.factory.getOrderService(params.chain);
        return await service.executeSwap(params);
    }

    @Post('/batch-swap')
    @FillUsername()
    @ApiResponse({
        status: 201,
        type: [SwapOrderResponseDto],
        description: 'Swap orders'
    })
    async executeSwapsInBatch(@Body() params: CreateBatchedSwapOrderDto): Promise<SwapOrderResponseDto[]> {
        const service = this.factory.getOrderService(params.orders[0].chain);
        return await service.executeSwapsInBatch(params.orders);
    }

    @Post('/transfer')
    @FillUsername()
    @ApiResponse({
        status: 201,
        type: TransferOrderResponseDto,
        description: 'Transfer order'
    })
    async transfer(@Body() params: CreateTransferOrderDto): Promise<TransferOrderResponseDto> {
        const service = this.factory.getOrderService(params.chain);
        return await service.transfer(params);
    }

    @Post('/withdraw')
    @FillUsername()
    @ApiResponse({
        status: 201,
        type: WithdrawalOrderResponseDto,
        description: 'Withdrawal order'
    })
    async withdraw(@Body() params: CreateWithdrawalOrderDto): Promise<WithdrawalOrderResponseDto> {
        const service = this.factory.getOrderService(params.chain);
        return await service.withdraw(params);
    }

    @Post('/batch-transfer')
    @FillUsername()
    @ApiResponse({
        status: 201,
        type: [TransferOrderResponseDto],
        description: 'Transfer orders'
    })
    async executeTransfersInBatch(@Body() params: CreateBatchedTransferDto): Promise<TransferOrderResponseDto[]> {
        const service = this.factory.getOrderService(params.chain);
        return await service.transferInBatch(params);
    }

    @Post('/transfer-multi-senders')
    @FillUsername()
    @ApiResponse({
        status: 201,
        type: [TransferOrderResponseDto],
        description: 'Transfer orders'
    })
    async transferMultiSenders(@Body() params: CreateBatchedTransferMultiSendersDto): Promise<TransferOrderResponseDto[]> {
        const service = this.factory.getOrderService(params.chain);
        return await service.transferInBatchMultiSenders(params);
    }

    @Get('/query-swaps')
    @ApiResponse({
        status: 200,
        type: [SwapOrderResponseDto],
        description: 'Swap orders'
    })
    async querySwaps(@Query() params: QuerySwapOrderDto): Promise<SwapOrderResponseDto[]>{
        const service = this.factory.getOrderService(params.chain);
        return await service.querySwaps(params);
    }
    
    @Get('/query-transfers')
    @ApiResponse({
        status: 200,
        type: [TransferOrderResponseDto],
        description: 'Transfers'
    })
    async queryTransfers(@Query() params: QueryTransferOrderDto): Promise<TransferOrderResponseDto[]>{
        const service = this.factory.getOrderService(params.chain);
        return await service.queryTransfers(params);
    }

    @Get('/query-withdrawals')
    @ApiResponse({
        status: 200,
        type: [WithdrawalOrderResponseDto],
        description: 'Withdrawals'
    })
    async queryWithdrawals(@Query() params: QueryWithdrawalOrderDto): Promise<WithdrawalOrderResponseDto[]>{
        const service = this.factory.getOrderService(params.chain);
        return await service.queryWithdrawals(params);
    }

    @Get('/poll')
    @ApiResponse({
        status: 200,
        type: [BaseOrderWithTagResponseDto],
        description: 'Orders'
    })
    async queryOrders(@Query() params: QueryBaseOrderDto): Promise<BaseOrderWithTagResponseDto[]>{
        const service = this.factory.getOrderService(params.chain);
        return await service.poll(params);
    }
}