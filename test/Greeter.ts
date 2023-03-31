import { expect } from "chai";
import { ethers } from "hardhat";

describe("Greeter", function () {
    it("Should return the new greeting once it's changed", async function () {
        const Greeter = await ethers.getContractFactory("Greeter");
        const greeter = await Greeter.deploy("FuckX");
        await greeter.deployed();
        expect(await greeter.greet()).to.equal("FuckX");
        await greeter.setGreeting("Me");
        expect(await greeter.greet()).to.equal("Me");
    });
});