import { ethers } from "hardhat";

async function main() {
    const PyramidV3 = await ethers.getContractFactory("PyramidV3");
    const pyramidV3 = await PyramidV3.deploy("Name", "Symbol", true, "0xCD929A4b1239B84A03d8B73Cff7Fb86aC4f73595", [1, 2, 3]);

    await pyramidV3.deployed();

    console.log(`PyramidV3 address: ${pyramidV3.address}`);
    console.log(`PyramidV3 owner: ${(await pyramidV3.owner()).toString()}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
