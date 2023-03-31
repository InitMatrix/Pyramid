import { ethers } from "hardhat";

async function main() {

    const PyramidV1 = await ethers.getContractFactory("PyramidV1");
    const pyramidV1 = await PyramidV1.deploy("Name", "Symbol", [1, 2, 3, 4, 5], false);

    await pyramidV1.deployed();

    console.log(`PyramidV1 address:${pyramidV1.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
