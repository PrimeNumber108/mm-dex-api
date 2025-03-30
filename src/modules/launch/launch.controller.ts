import { Body, Controller, Get, Post, Put, Query } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Launch } from "./launch.entity";
import { Repository } from "typeorm";
import { ApiResponse, ApiSecurity, ApiTags, ApiQuery } from "@nestjs/swagger";
import { Roles } from "src/decorators/roles.decorator";
import { UserRole } from "../user/user.entity";
import { ImportLaunchDto } from "./dtos/upsert-launch.dto";
import {FundDistribution} from "src/libs/module/fund-distribution"
import {Keys} from "src/libs/module/keys"
import {Token} from "src/libs/module/token"
import {sleep} from 'src/libs/utils/time'
import { A8_ADDRESS, NATIVE, PROVIDER } from "src/libs/utils/constants";
import {CryptoFEHelper} from "../utils/crypto"
import { env } from 'src/config';
import { parseEther, Wallet } from "ethers";


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

@ApiTags('launch')
@ApiSecurity('x-api-secret') // Ensure Swagger includes x-api-secret
@ApiSecurity('username') // Ensure Swagger includes username
@Controller('launch')
export class LaunchController {
    // private readonly factory: WalletServiceFactory;
    constructor(
        @InjectRepository(Launch)
        walletRepo: Repository<Launch>
    ) {
        // this.factory = new WalletServiceFactory(walletRepo);
    }
    
    @Post('/distribute')
    async distribution(@Body() { originalAddress, token, middleAddress, endAddress, tokenValue }: ImportLaunchDto): Promise<string> {
       
        //ori wallet, token, middle (address), end, calculate
        //get private key

        console.log('test value: ',originalAddress, token, middleAddress, endAddress, tokenValue)
        // await FundDistribution.distribute(
        //     {
        //         index: 0,
        //         privateKey: veryKeys[0].privateKey,
        //         address: veryKeys[0].address
        //     },
        //     A8_ADDRESS,
        //     middleKeys.slice(0, 1),
        //     meme5Keys,
        //     amounts5Raw.map(a => parseEther(a.toString()))
        // )
     
        // await sleep(10000);
        // //Check balance
        // const balances = await Token.getBalances(
        //     meme5Keys.map(k => k.address),
        //     [A8_ADDRESS, NATIVE],
        //     ['A8', 'ETH']
        // )
        // console.log(balances);
        return "Distribute Done"

    }


   
}