import { ethers } from "hardhat";

async function todeploy() {
    // const provider = new ethers.providers.JsonRpcProvider();

    // const [owner, A, B, C, D, E, F, G] = await ethers.getSigners();
    // 创建合约实例
    const PyramidV2 = await ethers.getContractFactory("PyramidV2")
    const pyramidv1 = await PyramidV2.deploy("Name", "Symbol", [1, 1, 1, 1, 1]);
    console.log(`pyramidv1 deployed address: ${pyramidv1.address}`);
    console.log(`合约Owner:${(await pyramidv1.owner())}`);
    return pyramidv1.address;
}

async function test(addr: string) {
    // "0x9F5A4E1427489083B037ec71834E1a00D9A49cc4"
    const [owner, A, B, C, D, E, F, G] = await ethers.getSigners();
    const PyramidV2 = await ethers.getContractFactory("PyramidV2");
    const pyramidv1 = PyramidV2.attach(addr);
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

async function setRoot(addr: string, targets: string[]) {
    const PyramidV2 = await ethers.getContractFactory("PyramidV2");
    const pyramidV2 = PyramidV2.attach(addr);
    await pyramidV2.setRoot(targets);
    for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        console.log(`${t} is root`);
    }
}
async function setRatios(addr: string, arr: number[]) {
    const PyramidV2 = await ethers.getContractFactory("PyramidV2");
    const pyramidV2 = PyramidV2.attach(addr);
    pyramidV2.setRatios(arr)

}

async function main() {
    const contract_address = "0x33585c7472f622E412807051692656fcd981A6d3";
    // 部署合约
    // const a = await todeploy();

    // 设置root节点
    // setRoot(contract_address, ["0x3489D205b5FE363125C26B2b519171E328F2e91f"]);
    setRatios(contract_address, [3, 2, 1]);
}

main().then(r => {
});