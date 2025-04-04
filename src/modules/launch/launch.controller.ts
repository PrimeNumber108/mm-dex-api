import { Body, Controller, Get, Post, Put, Query } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Launch } from "./launch.entity";
import { Repository } from "typeorm";
import { ApiResponse, ApiSecurity, ApiTags, ApiQuery } from "@nestjs/swagger";
import { DistributeLaunchDto, MixSwapDto, SwapDto, SnipeDto } from "./dtos/upsert-launch.dto";
import {FundDistribution} from "src/libs/module/fund-distribution"
import {Keys} from "src/libs/module/keys"
import {Token} from "src/libs/module/token"
import {sleep} from 'src/libs/utils/time'
import { A8_ADDRESS, NATIVE, PROVIDER } from "src/libs/utils/constants";
import {CryptoFEHelper} from "../utils/crypto"
import { env } from 'src/config';
import { parseEther, Wallet as EthersWallet } from "ethers";
import { WalletServiceFactory } from "src/libs/services/wallet/WalletServiceFactory";
import { Wallet } from 'src/modules/wallet/wallet.entity'; 
import {DojoMixTrade} from 'src/libs/module/dojo/mix-trade'
import { DojoSwap } from "src/libs/module/dojo/swap";
import { DojoSniper } from "src/libs/module/dojo/sniper";
import { MemeSniper } from "src/libs/module/meme/sniper";



// const veryKeys = (require('src/secrets/test/very-keys.json') as Keys.WalletKey[]).slice(0, 1);
// const middleKeys = (require('src/secrets/test/middle-keys.json') as Keys.WalletKey[]).slice(0, 1);
// const meme5Keys = (require('src/secrets/test/meme/sniper1.json') as Keys.WalletKey[]).slice(0, 3);
// const meme4Keys = require('src/secrets/test/meme/dex-sniper-keys.json') as Keys.WalletKey[];

import path from 'path';

const veryKeys = (require(path.join(__dirname, '../../secrets/test/very-keys.json')) as Keys.WalletKey[]).slice(0, 1);
const middleKeys = (require(path.join(__dirname, '../../secrets/test/middle-keys.json')) as Keys.WalletKey[]).slice(0, 1);
const meme5Keys = (require(path.join(__dirname, '../../secrets/test/meme/sniper1.json')) as Keys.WalletKey[]).slice(0, 3);
const meme4Keys = require(path.join(__dirname, '../../secrets/test/meme/dex-sniper-keys.json')) as Keys.WalletKey[];
const amounts5Raw = [
    323, 335, 252, 251,
    326, 252, 327, 291,
    267, 276
 ];

@ApiTags('Launch')
@ApiSecurity('x-api-secret') // Ensure Swagger includes x-api-secret
@ApiSecurity('username') // Ensure Swagger includes username
@Controller('launch')
export class LaunchController {
    private readonly walletFactory: WalletServiceFactory;
    private readonly walletRepo: Repository<Wallet>;  
    
    constructor(
        @InjectRepository(Launch)
        private readonly launchRepo: Repository<Launch>,  

        @InjectRepository(Wallet)
        walletRepo: Repository<Wallet>
    ) {
        this.walletRepo = walletRepo; 
        this.launchRepo = launchRepo;  
        this.walletFactory = new WalletServiceFactory(this.walletRepo);  

    }
    
    @Post('/distribute')
    async distribution(@Body() { originalAddress, token, middleAddress, endAddress, tokenValue }: DistributeLaunchDto): Promise<string> {
        //get private key
        const service = this.walletFactory.getWalletService("ancient8");

        //Param Original
        let originalRes = await service.getWallets(1, 10, originalAddress);

        //process middleKey
        let middleKeysArr = []
        for (let i = 0; i < middleAddress.length; i++) {
            let address = middleAddress[i];
            let middleRes = await service.getWallets(1, 1, address);
            
            let walletInfo = {
                index: i,
                privateKey: middleRes.data[0]?.privateKey,
                address: middleRes.data[0]?.address
            };
        
            middleKeysArr.push(walletInfo);
        }

        //process endkey
        let endKeysArr = []
        for (let i = 0; i < endAddress.length; i++) {
            let address = endAddress[i];
            let endRes = await service.getWallets(1, 1, address);
            
            let walletInfo = {
                index: i,
                privateKey: endRes.data[0]?.privateKey,
                address: endRes.data[0]?.address
            };
        
            endKeysArr.push(walletInfo);
        }
     
    
        await FundDistribution.distribute(
            {
                index: 0,
                privateKey: originalRes.data[0]?.privateKey,
                address: originalRes.data[0]?.address
            },
            token,
            middleKeysArr,
            endKeysArr,
            tokenValue.map(a => parseEther(a.toString()))
        )
     
        await sleep(10000);
        //Check balance
        const balances = await Token.getBalances(
            endKeysArr.map(k => k.address),
            [token, NATIVE],
            ['A8', 'ETH']
        )
        console.log(balances);
        return "Distribute Done"

    }


    @Post('/mix-swap')
    async mixSwap(@Body() {  middleAddress, endAddress, }: MixSwapDto): Promise<string> {
            await DojoMixTrade.mixSwapMultiWallets(
                middleKeys.concat(meme5Keys).map(k => k.privateKey),
                NATIVE,
                5
            )

            return "Mix Swap Done"
    }


    @Post('/swap')
    async Swap(@Body() {  originalAddress, token, middleAddress, endAddress, }: SwapDto): Promise<string> {
        //originalAddress, middleAddress, endaddress, token
        const balances = await Token.getBalances(
            middleAddress.map(k => k),
            [A8_ADDRESS, NATIVE],
            ['A8', 'ETH']
        )
        console.log(balances);
        for (let i = 0; i < meme4Keys.length; i++) {
            const key = meme4Keys[i];
            const eBal = balances[key.address]['ETH'];
            const eToTrade = parseEther(eBal) - parseEther('0.0008');
            const hash = await DojoSwap.buyTokenWithETH(new EthersWallet(key.privateKey, PROVIDER), A8_ADDRESS, eToTrade);
            console.log(hash)
        }
     
        const hash = await DojoSwap.sellTokenToETH(new EthersWallet(veryKeys[5].privateKey, PROVIDER), A8_ADDRESS, parseEther('100'));
        console.log(hash)

        return "Swap Done"

    }

    @Post('/snipe')
    async Snipe(@Body() {  tokenValue, endAddress, }: SnipeDto): Promise<string> {
    //endkey, raw
    const sniperKeys = meme5Keys;

    const sniperWallets = Keys.walletKeysToWallets(sniperKeys);

    const dexSniper = new DojoSniper.Sniper([], []);

    const memeSniper = new MemeSniper.Sniper(
        sniperWallets,
        amounts5Raw.map(r => parseEther(r.toString())),
        '0xc8124407f8CBeD5b01b19f3f39495EeDA585F397',
        dexSniper
    );


    await memeSniper.run();

    return "Snipe Done"

    }
   
}