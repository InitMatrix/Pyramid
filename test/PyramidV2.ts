
import { expect, use } from "chai";
import { ethers } from "hardhat"
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";


describe("PryamidV2", function () {
    async function deploPyramidV2Fixture() {

        const ratios = [5, 4, 3, 2, 1];
        // Contracts are deployed using the first signer/account by default
        const [owner, A, B, C, D, E, F, G, H] = await ethers.getSigners();

        const PyramidV2 = await ethers.getContractFactory("PyramidV2");
        const pyramidV2 = await PyramidV2.deploy("NAME", "SYMBOL", ratios);

        console.log(`部署的PyramidV2合约地址为:${pyramidV2.address}`)
        console.log(`owner地址:${owner.address}`)
        console.log(`A:${A.address}`)
        console.log(`B:${B.address}`)
        console.log(`C:${C.address}`)
        console.log(`D:${D.address}`)
        console.log(`E:${E.address}`)
        console.log(`F:${F.address}`)
        console.log(`G:${G.address}`)
        return { pyramidV2, ratios, owner, A, B, C, D, E, F, G, H };
    }
    describe("Amdin", function () {
        it("管理员地址设置正确", async function () {
            const { pyramidV2, ratios, owner, A, B, C, D, E, F, G, H } = await loadFixture(deploPyramidV2Fixture);
            console.log(`_ratios =${pyramidV2._ratios(1)}`)
            // console.log(`_ratios =${(await pyramidV2).toNumber()}`)
            expect(await pyramidV2.owner()).to.equal(owner.address);
            expect((await pyramidV2.maxLevel()).toNumber()).to.equal(5);
        });

        it("权重和等级设置正确", async function () {
            const { pyramidV2, ratios, owner, A, B, C, D, E, F, G, H } = await loadFixture(deploPyramidV2Fixture);
            console.log(`_ratios =${pyramidV2._ratios(1)}`)
            console.log(`_ratios =${(await pyramidV2.maxLevel()).toNumber()}`)
            expect((await pyramidV2.maxLevel()).toNumber()).to.equal(5);

            expect((await pyramidV2._ratios(0)).toNumber()).to.equal(5);
            expect((await pyramidV2._ratios(1)).toNumber()).to.equal(4);
            expect((await pyramidV2._ratios(2)).toNumber()).to.equal(3);
            expect((await pyramidV2._ratios(3)).toNumber()).to.equal(2);
            expect((await pyramidV2._ratios(4)).toNumber()).to.equal(1);
        });

        it("根节点判断正确", async function () {
            const { pyramidV2, ratios, owner, A, B, C, D, E, F, G, H } = await loadFixture(deploPyramidV2Fixture);
            await pyramidV2.connect(owner).setRoot([A.address, B.address]);
            var result = (await pyramidV2.connect(owner).isRoot(owner.address)).valueOf()
            console.log(`owner is root:${result}`)
            expect(result).to.equal(true);
            var result = (await pyramidV2.connect(A).isRoot(A.address)).valueOf()
            console.log(`A is root:${result}`)
            expect(result).to.equal(true);
            var result = (await pyramidV2.connect(B).isRoot(B.address)).valueOf()
            console.log(`B is root:${result}`)
            expect(result).to.equal(true);
            var result = (await pyramidV2.connect(C).isRoot(C.address)).valueOf()
            console.log(`C is root:${result}`)
            expect(result).to.equal(false);
        });

        it("绑定关系判断正确", async function () {
            const { pyramidV2, ratios, owner, A, B, C, D, E, F, G, H } = await loadFixture(deploPyramidV2Fixture);
            await pyramidV2.connect(owner).setRoot([A.address, B.address]);
            await pyramidV2.connect(C).bind(A.address);
            console.log("bind A->C");
            expect((await pyramidV2.connect(C).parentOf(C.address)).toString()).to.equal(A.address);

            await pyramidV2.connect(D).bind(A.address);
            console.log("bind A->D");
            expect((await pyramidV2.connect(D).parentOf(D.address)).toString()).to.equal(A.address);


            await pyramidV2.connect(E).bind(C.address);
            console.log("bind C->E");
            expect((await pyramidV2.connect(E).parentOf(E.address)).toString()).to.equal(C.address);

            await pyramidV2.connect(F).bind(E.address);
            console.log("bind E->F");
            expect((await pyramidV2.connect(F).parentOf(F.address)).toString()).to.equal(E.address);

            await pyramidV2.connect(G).bind(F.address);
            console.log("bind F->G");
            expect((await pyramidV2.connect(G).parentOf(G.address)).toString()).to.equal(F.address);

            console.log("no bind H");
            expect((await pyramidV2.connect(H).parentOf(H.address)).toString()).to.equal("0x0000000000000000000000000000000000000000");

            var result = await pyramidV2.getRebate(A.address)
            console.log(result)
            expect(result[0][0]).to.equal(A.address);
            expect(result[1][0].toNumber()).to.equal(1);

            var result = await pyramidV2.getRebate(B.address)
            console.log(result)
            expect(result[0][0]).to.equal(B.address);
            expect(result[1][0].toNumber()).to.equal(1);

            var result = await pyramidV2.getRebate(C.address)
            console.log(result)
            expect(result[0][0]).to.equal(C.address);
            expect(result[0][1]).to.equal(A.address);

            var result = await pyramidV2.getRebate(G.address)
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
            var result = await pyramidV2.getRebate(H.address)
            console.log(result)
            expect(result[0][0]).to.equal(H.address);
            expect(result[1][0].toNumber()).to.equal(0);
        });

        it("更换分佣等级正确", async function () {
            const { pyramidV2, ratios, owner, A, B, C, D, E, F, G, H } = await loadFixture(deploPyramidV2Fixture);
            await pyramidV2.setRatios([5, 4, 3, 2, 1]);
            expect((await pyramidV2.maxLevel()).toNumber()).to.equal(5);
            // 先设置绑定关系A-B-C-D-E
            await pyramidV2.connect(owner).setRoot([A.address]);
            await pyramidV2.connect(B).bind(A.address);
            await pyramidV2.connect(C).bind(B.address);
            await pyramidV2.connect(D).bind(C.address);
            await pyramidV2.connect(E).bind(D.address);
            //获取权重关系
            var result = await pyramidV2.connect(E).getRebate(E.address);
            expect(result[0][0]).to.equal(E.address);
            expect(result[0][1]).to.equal(D.address);
            expect(result[0][2]).to.equal(C.address);
            expect(result[0][3]).to.equal(B.address);
            expect(result[0][4]).to.equal(A.address);

            expect(result[1][0]).to.equal(5);
            expect(result[1][1]).to.equal(4);
            expect(result[1][2]).to.equal(3);
            expect(result[1][3]).to.equal(2);
            expect(result[1][4]).to.equal(1);
            console.log(`更换权重列表前maxlevel=`, (await pyramidV2.maxLevel()).toNumber())
            await pyramidV2.connect(owner).setRatios([30, 20, 10]);
            console.log(`更换权重列表后maxlevel=`, (await pyramidV2.maxLevel()).toNumber())
            expect(await pyramidV2.maxLevel()).to.equal(3);
            result = await pyramidV2.connect(E).getRebate(E.address);
            console.log(result[0]);
            console.log(result[1]);
            expect(result[0].length).to.equal(3);
            expect(result[1].length).to.equal(3);

            expect(result[0][0]).to.equal(E.address);
            expect(result[0][1]).to.equal(D.address);
            expect(result[0][2]).to.equal(C.address);

            expect(result[1][0]).to.equal(30);
            expect(result[1][1]).to.equal(20);
            expect(result[1][2]).to.equal(10);

        })
    }
    )
})
