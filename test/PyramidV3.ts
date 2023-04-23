
import { expect, use } from "chai";
import { ethers } from "hardhat"
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";


describe("PryamidV3", function () {
    async function deploPyramidV3Fixture() {

        const ratios = [3, 2, 1];
        // Contracts are deployed using the first signer/account by default
        const [owner, A, B, C, D, E, F, G, H] = await ethers.getSigners();
        const EventOut = await ethers.getContractFactory("EventOut");
        const eventout = await EventOut.deploy();
        console.log(`eventout 部署地址成功 =${eventout.address}`)



        const PyramidV3 = await ethers.getContractFactory("PyramidV3");
        const pyramidV3 = await PyramidV3.deploy("NAME", "SYMBOL", true, eventout.address, ratios);

        console.log(`PyramidV3部署成功:${pyramidV3.address}`)
        console.log(`owner地址:${owner.address}`)
        console.log(`A:${A.address}`)
        console.log(`B:${B.address}`)
        console.log(`C:${C.address}`)
        console.log(`D:${D.address}`)
        console.log(`E:${E.address}`)
        console.log(`F:${F.address}`)
        console.log(`G:${G.address}`)
        return { pyramidV3, ratios, owner, A, B, C, D, E, F, G, H };
    }
    describe("Amdin", function () {
        it("管理员地址设置正确", async function () {
            const { pyramidV3, ratios, owner, A, B, C, D, E, F, G, H } = await loadFixture(deploPyramidV3Fixture);
            console.log(`_ratios =${pyramidV3._ratios(1)}`)
            console.log(`_allowRoot =${pyramidV3._allowRoot()}`)
            console.log(`_eventout =${pyramidV3._eventout}`)
            expect(await pyramidV3.owner()).to.equal(owner.address);
        });

        it("权重和等级设置正确", async function () {
            const { pyramidV3, ratios, owner, A, B, C, D, E, F, G, H } = await loadFixture(deploPyramidV3Fixture);
            await pyramidV3.connect(A).bindSystem();
            const tokenidA = await pyramidV3.getNFT(A.address);
            console.log(`A绑定系统成功 A NFT id=${tokenidA}`);

            await pyramidV3.connect(B).bindParent(tokenidA);
            const tokenidB = await pyramidV3.getNFT(B.address);
            console.log(`B绑定A成功 B NFT id=${tokenidB}`);

            await pyramidV3.connect(C).bindParent(tokenidB);
            const tokenidC = await pyramidV3.getNFT(C.address);
            console.log(`C绑定B成功 C NFT id=${tokenidC}`);

            await pyramidV3.connect(D).bindParent(tokenidB);
            const tokenidD = await pyramidV3.getNFT(D.address);
            console.log(`D绑定B成功 D NFT id=${tokenidD}`);

            const resultA = await pyramidV3.getRebate(A.address);
            console.log(`result A =${resultA[0]}|| ${resultA[1]}`);
            const resultB = await pyramidV3.getRebate(B.address);
            console.log(`result B =${resultB[0]}|| ${resultB[1]}`);

            const resultC = await pyramidV3.getRebate(C.address);
            console.log(`result C =${resultC[0]}|| ${resultC[1]}`);

            const resultD = await pyramidV3.getRebate(D.address);
            console.log(`result D =${resultD[0]}|| ${resultD[1]}`);

            // expect(resultA[0]).to.equal(tokenidA);
        });

    }
    )
})
