export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}