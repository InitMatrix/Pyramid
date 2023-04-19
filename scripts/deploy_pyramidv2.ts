import { ethers } from "hardhat";

async function main() {
    const PyramidV2 = await ethers.getContractFactory("PyramidV2");
    const pyramidV2 = await PyramidV2.deploy("Name", "Symbol", [1, 2, 3]);

    await pyramidV2.deployed();

    console.log(`PyramidV2 address: ${pyramidV2.address}`);
    console.log(`PyramidV2 owner: ${(await pyramidV2.owner()).toString()}`)
    console.log(`PyramidV2 max level: ${(await pyramidV2.maxLevel()).toString()}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
