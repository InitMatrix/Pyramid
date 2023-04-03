import { ethers } from "hardhat";
import { string } from "hardhat/internal/core/params/argumentTypes";
async function deploy() {
    // const provider = new ethers.providers.JsonRpcProvider();

    const [owner, A, B, C, D, E, F, G] = await ethers.getSigners();
    // 创建合约实例
    const PyramidV1 = await ethers.getContractFactory("PyramidV1")
    const pyramidv1 = await PyramidV1.connect(owner).deploy("Name", "Symbol", [1, 1, 1, 1, 1], false);
    console.log(`pyramidv1 deployed address: ${pyramidv1.address}`);
    console.log(`合约Owner:${(await pyramidv1.owner())}`);
    return pyramidv1.address;
}
async function start(addr: string) {
    // "0x9F5A4E1427489083B037ec71834E1a00D9A49cc4"
    const [owner, A, B, C, D, E, F, G] = await ethers.getSigners();
    const PyramidV1 = await ethers.getContractFactory("PyramidV1");
    const pyramidv1 = PyramidV1.attach(addr);
    print(`constract address: ${pyramidv1.address}`);
    print(`owner address: ${(await pyramidv1.owner()).toString()}`);
    await pyramidv1.connect(owner).setRatios([1, 2, 3, 4, 5]);
    await pyramidv1.connect(owner).setRoot([A.address, B.address]);
    pyramidv1.on("CreateNode", (from_, to_, tokenId_, level_) => {
        console.log(`Received a CreateNode event: from:${from_} to:${to_},tokenID:${tokenId_} level:${level_}`);
    });
    await pyramidv1.connect(C).bind(A.address);
    await pyramidv1.connect(D).bind(C.address);
    await pyramidv1.connect(E).bind(D.address);
    await pyramidv1.connect(F).bind(E.address);
    const z = await pyramidv1.getRebate(F.address)
    print(z[0].toString());
    print(z[1].toString());






}
function print(s: any) {
    console.log(s);

}
async function main() {
    // 连接以太坊
    const addr = await deploy();
    // 创建
    start(addr);


}
main();