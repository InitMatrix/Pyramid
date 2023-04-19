import { ethers } from "hardhat";

async function main() {

    const Demo = await ethers.getContractFactory("Demo");
    const demo = await Demo.deploy();

    await demo.deployed();

    console.log(`Dmeo address: ${demo.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
