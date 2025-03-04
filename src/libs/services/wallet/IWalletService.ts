import { QueryClusterDto, QueryWalletDto, QueryWalletsDto } from "src/modules/wallet/dtos/query-wallet.dto";
import { GenerateClusterDto, GenerateWalletDto, ImportClusterDto, ImportWalletDto, RenameClusterDto } from "src/modules/wallet/dtos/upsert-wallet.dto";
import { WalletPrivateResponseDto, WalletResponseDto } from "src/modules/wallet/dtos/wallet.dto";

export interface IWalletService {
    readonly chain: string;

    listAllClusters(): Promise<string[]>;

    getCluster(params: QueryClusterDto): Promise<WalletResponseDto[]>;
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
}