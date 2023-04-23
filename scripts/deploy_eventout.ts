import { ethers } from "hardhat";

async function main() {

    const Eventout = await ethers.getContractFactory("EventOut");
    const eventout = await Eventout.deploy();

    await eventout.deployed();

    console.log(`Dmeo address: ${eventout.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
