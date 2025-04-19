import { QueryClusterDto, QueryWalletDto, QueryWalletsDto } from "src/modules/wallet/dtos/query-wallet.dto";
import { GenerateClusterDto, GenerateWalletDto, ImportClusterDto, ImportWalletDto, RenameClusterDto, SupportChainsDto } from "src/modules/wallet/dtos/upsert-wallet.dto";
import { WalletPrivateResponseDto, WalletResponseDto } from "src/modules/wallet/dtos/wallet.dto";
import { Wallet } from "src/modules/wallet/wallet.entity";

export interface IWalletService {
    readonly chain: string;

    listAllClusters(): Promise<string[]>;

    getCluster(params: QueryClusterDto): Promise<WalletResponseDto[]>;
    getClusterAddresses(params: QueryClusterDto): Promise<string[]>;
    renameCluster(params: RenameClusterDto): Promise<boolean>;
    
    assertWalletForExecution(params: QueryWalletDto): Promise<WalletPrivateResponseDto>;
    assertWalletsForExecution(params: QueryWalletsDto): Promise<WalletPrivateResponseDto[]>;
    assertKnownAccount(params: QueryWalletDto): Promise<string>;
    assertKnownAccounts(params: QueryWalletsDto): Promise<string[]>;

    generateCluster(params: GenerateClusterDto): Promise<WalletPrivateResponseDto[]>;
    importCluster(params: ImportClusterDto): Promise<WalletPrivateResponseDto[]>;
    importWallet(params: ImportWalletDto): Promise<WalletPrivateResponseDto>;
    generateWallet(params: GenerateWalletDto): Promise<WalletPrivateResponseDto>;
    // deactivateWallet(params: QueryWalletDto): Promise<string>; // return private key
    // deactivateCluster(params: QueryClusterDto): Promise<ClusterPrivateResponseDto>;

    getWalletByAddress(address: string): Promise<Wallet>;
    getWallets(page: number, pageSize: number, address?: string): Promise<{ total: number; data: Wallet[] }>;
    poll(): Promise<WalletResponseDto[]>;
    supportChains(params: SupportChainsDto): Promise<WalletResponseDto[]>;
}