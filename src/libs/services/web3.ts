import { NATIVE, NetworkConfigs } from "../consts";

export namespace Web3Helper {
    export function getTokensInRightOrder(chain: string, tokenIn: string, tokenOut: string) {
        const wTokenIn = tokenIn === NATIVE ? NetworkConfigs[chain].wrappedNative : tokenIn;
        const wTokenOut = tokenOut === NATIVE ? NetworkConfigs[chain].wrappedNative : tokenOut;
        return BigInt(wTokenIn) < BigInt(wTokenOut) ?
            {
                token0: wTokenIn,
                token1: wTokenOut
            } : {
                token1: wTokenIn,
                token0: wTokenOut
            }
    }
    export function getERC20Representation(chain: string, token: string) {
        return token === NATIVE ? NetworkConfigs[chain].wrappedNative : token;
    }
}