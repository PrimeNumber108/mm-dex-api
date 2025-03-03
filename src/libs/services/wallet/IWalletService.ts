import { QueryClusterDto, QueryWalletDto, QueryWalletsDto } from "src/modules/wallet/dtos/query-wallet.dto";
import { GenerateClusterDto, GenerateWalletDto, ImportClusterDto, ImportWalletDto } from "src/modules/wallet/dtos/upsert-wallet.dto";
import { ClusterPrivateResponseDto, ClusterResponseDto, WalletPrivateResponseDto } from "src/modules/wallet/dtos/wallet.dto";

export interface IWalletService {
    readonly chain: string;

    getCluster(params: QueryClusterDto): Promise<ClusterResponseDto>;
    assertWalletForExecution(params: QueryWalletDto): Promise<WalletPrivateResponseDto>;
    assertWalletsForExecution(params: QueryWalletsDto): Promise<WalletPrivateResponseDto[]>;
    assertKnownAccount(params: QueryWalletDto): Promise<string>;
    assertKnownAccounts(params: QueryWalletsDto): Promise<string[]>;

    generateCluster(params: GenerateClusterDto): Promise<ClusterPrivateResponseDto>;
    importCluster(params: ImportClusterDto): Promise<ClusterPrivateResponseDto>;
    importWallet(params: ImportWalletDto): Promise<WalletPrivateResponseDto>;
    generateWallet(params: GenerateWalletDto): Promise<WalletPrivateResponseDto>;
    // deactivateWallet(params: QueryWalletDto): Promise<string>; // return private key
    // deactivateCluster(params: QueryClusterDto): Promise<ClusterPrivateResponseDto>;
}