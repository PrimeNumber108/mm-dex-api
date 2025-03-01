import { QueryClusterDto, QueryWalletDto } from "src/modules/wallet/dtos/query-wallet.dto";
import { GenerateClusterDto, GenerateWalletDto, ImportClusterDto, ImportWalletDto } from "src/modules/wallet/dtos/upsert-wallet.dto";
import { ClusterPrivateResponseDto, ClusterResponseDto, WalletPrivateResponseDto } from "src/modules/wallet/dtos/wallet.dto";

export interface IWalletService {
    readonly chain: string;

    getCluster(params: QueryClusterDto): Promise<ClusterResponseDto>;

    generateCluster(params: GenerateClusterDto): Promise<ClusterPrivateResponseDto>;
    importCluster(params: ImportClusterDto): Promise<ClusterPrivateResponseDto>;
    importWallet(params: ImportWalletDto): Promise<WalletPrivateResponseDto>;
    generateWallet(params: GenerateWalletDto): Promise<WalletPrivateResponseDto>;
    removeWallet(params: QueryWalletDto): Promise<string>; // return private key
    removeCluster(params: QueryClusterDto): Promise<ClusterPrivateResponseDto>;
}