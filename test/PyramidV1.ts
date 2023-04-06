
import { expect } from "chai";
import { ethers } from "hardhat"
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";


describe("PryamidV1", function () {
    async function deploPyramidV1Fixture() {

        const ratios = [1, 2, 3, 4, 5];
        // Contracts are deployed using the first signer/account by default
        const [owner, A, B, C, D, E, F, G, H] = await ethers.getSigners();
        // const PyramidV1 = await ethers.getContractFactory("PyramidV1");
        // const pyramidv1 = await PyramidV1.deploy("NAME", "SYMBOL", ratios);
        // const Lock = await ethers.getContractFactory("Lock");
        const PyramidV1 = await ethers.getContractFactory("PyramidV1");
        const pyramidv1 = await PyramidV1.deploy("NAME", "SYMBOL", ratios, false);

        console.log(`部署的PyramidV1合约地址为:${pyramidv1.address}`)
        console.log(`owner地址:${owner.address}`)
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
        it("管理员地址设置正确", async function () {
            const { pyramidv1, ratios, owner, A, B, C, D, E, F, G, H } = await loadFixture(deploPyramidV1Fixture);
            console.log(`_ratios =${pyramidv1._ratios(1)}`)
            console.log(`_ratios =${(await pyramidv1._maxLevel()).toNumber()}`)
            expect(await pyramidv1.owner()).to.equal(owner.address);
            expect((await pyramidv1._maxLevel()).toNumber()).to.equal(5);
        });

        it("权重和等级设置正确", async function () {
            const { pyramidv1, ratios, owner, A, B, C, D, E, F, G, H } = await loadFixture(deploPyramidV1Fixture);
            console.log(`_ratios =${pyramidv1._ratios(1)}`)
            console.log(`_ratios =${(await pyramidv1._maxLevel()).toNumber()}`)
            expect((await pyramidv1._maxLevel()).toNumber()).to.equal(5);
            expect((await pyramidv1._ratios(0)).toNumber()).to.equal(1);
            expect((await pyramidv1._ratios(1)).toNumber()).to.equal(2);
            expect((await pyramidv1._ratios(2)).toNumber()).to.equal(3);
            expect((await pyramidv1._ratios(3)).toNumber()).to.equal(4);
            expect((await pyramidv1._ratios(4)).toNumber()).to.equal(5);
            await pyramidv1.setRatios([1, 1, 1, 1, 1, 1]);
            expect((await pyramidv1._maxLevel()).toNumber()).to.equal(6);
            expect((await pyramidv1._ratios(0)).toNumber()).to.equal(1);
            expect((await pyramidv1._ratios(1)).toNumber()).to.equal(1);
            expect((await pyramidv1._ratios(2)).toNumber()).to.equal(1);
            expect((await pyramidv1._ratios(3)).toNumber()).to.equal(1);
            expect((await pyramidv1._ratios(4)).toNumber()).to.equal(1);
            expect((await pyramidv1._ratios(5)).toNumber()).to.equal(1);
        });
        // it("xxxxxx", async function () {
        //     const { pyramidv1, ratios, owner, A, B, C, D, E, F, G, H } = await loadFixture(deploPyramidV1Fixture);
        // expect().to.equal();

        // });
        it("根节点设置正确", async function () {
            const { pyramidv1, ratios, owner, A, B, C, D, E, F, G, H } = await loadFixture(deploPyramidV1Fixture);
            await pyramidv1.connect(owner).setRoot([A.address, B.address]);
            var result = (await pyramidv1.connect(owner).isRoot(owner.address)).valueOf()
            console.log(`owner is root:${result}`)
            expect(result).to.equal(true);
            var result = (await pyramidv1.connect(owner).isRoot(A.address)).valueOf()
            console.log(`A is root:${result}`)
            expect(result).to.equal(true);
            var result = (await pyramidv1.connect(owner).isRoot(B.address)).valueOf()
            console.log(`B is root:${result}`)
            expect(result).to.equal(true);

            var result = (await pyramidv1.connect(owner).isRoot(C.address)).valueOf()
            console.log(`C is root:${result}`)
            expect(result).to.equal(false);
        });

        it("绑定关系正确", async function () {
            const { pyramidv1, ratios, owner, A, B, C, D, E, F, G, H } = await loadFixture(deploPyramidV1Fixture);
            await pyramidv1.connect(owner).setRoot([A.address, B.address]);
            await pyramidv1.connect(C).bind(A.address);
            console.log("bind A->C");
            expect((await pyramidv1.connect(C).parentOf(C.address)).toString()).to.equal(A.address);

            await pyramidv1.connect(D).bind(A.address);
            console.log("bind A->D");
            expect((await pyramidv1.connect(D).parentOf(D.address)).toString()).to.equal(A.address);


            await pyramidv1.connect(E).bind(C.address);
            console.log("bind C->E");
            expect((await pyramidv1.connect(E).parentOf(E.address)).toString()).to.equal(C.address);


            await pyramidv1.connect(F).bind(E.address);
            console.log("bind E->F");
            expect((await pyramidv1.connect(F).parentOf(F.address)).toString()).to.equal(E.address);


            await pyramidv1.connect(G).bind(F.address);
            console.log("bind F->G");
            expect((await pyramidv1.connect(G).parentOf(G.address)).toString()).to.equal(F.address);

            console.log("no bind H");
            expect((await pyramidv1.connect(H).parentOf(H.address)).toString()).to.equal("0x0000000000000000000000000000000000000000");

            var result = await pyramidv1.getRebate(A.address)
            console.log(result)
            expect(result[0][0]).to.equal(A.address);
            expect(result[1][0].toNumber()).to.equal(1);

            var result = await pyramidv1.getRebate(B.address)
            console.log(result)
            expect(result[0][0]).to.equal(B.address);
            expect(result[1][0].toNumber()).to.equal(1);

            var result = await pyramidv1.getRebate(C.address)
            console.log(result)
            expect(result[0][0]).to.equal(C.address);
            expect(result[0][1]).to.equal(A.address);

            var result = await pyramidv1.getRebate(G.address)
            console.log(result)
            expect(result[0][0]).to.equal(G.address);
            expect(result[0][1]).to.equal(F.address);
            expect(result[0][2]).to.equal(E.address);
            expect(result[0][3]).to.equal(C.address);
            expect(result[0][4]).to.equal(A.address);

            expect(result[1][0].toNumber()).to.equal(5);
            expect(result[1][1].toNumber()).to.equal(4);
            expect(result[1][2].toNumber()).to.equal(3);
            expect(result[1][3].toNumber()).to.equal(2);
            expect(result[1][4].toNumber()).to.equal(1);

            var result = await pyramidv1.getRebate(H.address)
            console.log(result)
            expect(result[0][0]).to.equal(H.address);

            expect(result[1][0].toNumber()).to.equal(0);


        });

    }
    )
})
