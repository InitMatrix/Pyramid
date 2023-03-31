import { ethers } from "hardhat";

async function main() {
    // 获得将要部署的合约
    const Greeter = await ethers.getContractFactory("Greeter");
    // 开始部署
    const greeter = await Greeter.deploy("Hello, Hardhat!");
    // 部署成功后打印合约地址
    console.log("Greeter deployed to:", greeter.address);
}
// main方法
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });