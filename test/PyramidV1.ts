
import { expect } from "chai";
import { ethers } from "hardhat"
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";


describe("PryamidV1", function () {
    async function deploPyramidV1Fixture() {

        const ratios = [10, 20, 30, 40, 50];
        // Contracts are deployed using the first signer/account by default
        const [owner, A, B, C, D, E, F, G, H] = await ethers.getSigners();
        // const PyramidV1 = await ethers.getContractFactory("PyramidV1");
        // const pyramidv1 = await PyramidV1.deploy("NAME", "SYMBOL", ratios);
        // const Lock = await ethers.getContractFactory("Lock");
        const PyramidV1 = await ethers.getContractFactory("PyramidV1");
        const pyramidv1 = await PyramidV1.deploy("NAME", "SYMBOL", ratios, false);

        console.log(`部署的PyramidV1合约地址为:${pyramidv1.address}`)
        console.log(`owner:${owner.address}`)
        console.log(`A:${A.address}`)
        console.log(`B:${B.address}`)
        console.log(`C:${C.address}`)
        console.log(`D:${D.address}`)
        console.log(`E:${E.address}`)
        console.log(`F:${F.address}`)
        console.log(`G:${G.address}`)
        return { pyramidv1, ratios, owner, A, B, C, D, E, F, G, H };
    }
    describe("Amdin", function () {
        it("owner is right", async function () {
            const { pyramidv1, ratios, owner, A, B, C, D, E, F, G, H } = await loadFixture(deploPyramidV1Fixture);
            // console.log(`_ratios =${pyramidv1._ratios()}`)
            expect(await pyramidv1.owner()).to.equal(owner.address);
            // expect((await pyramidv1._maxLevel()).toNumber).to.equal(5);
            // expect(await pyramidv1._ratios).to.equal(ratios);
        });
        it("节点测试", async function () {
            const { pyramidv1, ratios, owner, A, B, C, D, E, F, G, H } = await loadFixture(deploPyramidV1Fixture);
            await pyramidv1.connect(owner).setRatios([1, 2, 3, 4, 5]);
            await pyramidv1.connect(owner).setRoot([A.address, B.address]);
            console.log("set root A,B");

            await pyramidv1.connect(C).bind(A.address);
            console.log("bind A->C");

            await pyramidv1.connect(D).bind(A.address);
            console.log("bind A->D");

            await pyramidv1.connect(E).bind(C.address);
            console.log("bind C->E");

            await pyramidv1.connect(F).bind(E.address);
            console.log("bind E->F");

            await pyramidv1.connect(G).bind(F.address);
            console.log("bind F->G");
            const arr = [A, B, C, D, E, F, G, H];
            for (let index = 0; index < arr.length; index++) {
                const user = arr[index];
                var result = await pyramidv1.connect(owner).getRebate(user.address);
                console.log(`user:${user.address} result=${result}`);
            }
        });
    })
});