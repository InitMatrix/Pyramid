// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;
pragma abicoder v2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./interface/IEventOut.sol";

// 使用 ERC721URISt4orage 扩展的合约
contract PyramidV3 is ERC721, Ownable {
    struct Node {
        address account; //用户地址e
        uint256 parentId; //父级节点NFT ID
        // uint256 level; //等级
        // uint256 childCount; //子级节点的数量
    }
    uint256 private _tokenIdTracker;
    uint256[] public _ratios;
    bool public _allowRoot;
    address public _eventout;

    mapping(address => uint256) _users;
    mapping(uint256 => Node) _nodes;

    // event CliamNFT(address user);
    event BindNFT(
        address child,
        address parent,
        uint256 childId,
        uint256 parentId
    );

    event SetRatios(uint256[] ratios);
    event SetAllowRoot(bool allow);

    constructor(
        string memory name,
        string memory symbol,
        bool allowRoot,
        address eventout,
        uint256[] memory ratios
    ) ERC721(name, symbol) {
        _ratios = ratios;
        _allowRoot = allowRoot;
        _eventout = eventout;
        // emit SetAllowRoot(allowRoot);
        // emit SetRatios(ratios);
        bytes memory datas = abi.encode(_allowRoot, _ratios);
        eventOut(1, datas);
    }

    function eventOut(uint32 _type, bytes memory _value) internal {
        IEventOut(_eventout).eventOut(_type, _value);
    }

    function setAllowRoot(bool allow) external onlyOwner {
        _allowRoot = allow;
        bytes memory datas = abi.encode(_allowRoot, _ratios);
        eventOut(1, datas);
    }

    function setRatios(uint256[] memory ratios) external onlyOwner {
        _ratios = ratios;
        bytes memory datas = abi.encode(_allowRoot, _ratios);
        eventOut(1, datas);
    }

    /// 主动领取NFT，并绑定系统
    function bindSystem() external {
        require(_allowRoot, "not allow be root");
        require(!_hasMint(msg.sender), "this address already minted");
        uint256 tokenId = _toMint();
        _toBind(msg.sender, address(0), tokenId, 0);
    }

    // 接收邀请，领取NFT，绑定NFT
    function bindParent(uint256 parentId) external {
        // 从未绑定
        require(!_hasMint(msg.sender), "this address already minted");
        // 上级NFT必须存在
        require(_exists(parentId), "parent NFT is not exist");
        uint256 tokenId = _toMint();
        _toBind(msg.sender, ownerOf(parentId), tokenId, parentId);
    }

    function getRebate(
        address account
    ) external view returns (uint256[] memory, uint256[] memory) {
        if (!_hasMint(account)) {
            uint256[] memory x = new uint256[](1);
            uint256[] memory y = new uint256[](1);
            x[0] = 0;
            y[0] = 0;
            return (x, y);
        } else {
            uint256 n = _levels();
            uint256[] memory x = new uint256[](n);
            uint256[] memory y = new uint256[](n);
            uint256 curos = _users[account];
            uint256 p = 0;
            for (uint i = 0; i < n; i++) {
                Node memory node = _nodes[curos];
                x[i] = curos;
                y[i] = _ratios[i];
                p = i + 1;
                if (node.parentId == 0) {
                    break;
                }
                curos = node.parentId;
            }
            uint256[] memory xx = new uint256[](p);
            uint256[] memory yy = new uint256[](p);
            for (uint j = 0; j < p; j++) {
                xx[j] = x[j];
                yy[j] = y[j];
            }

            return (xx, yy);
        }
    }

    /// 获取tokenid的持有者地址
    /// @param nftID nft tokenid
    function getOwner(uint256 nftID) public view returns (address) {
        return ownerOf(nftID);
    }

    function getNFT(address user) public view returns (uint256) {
        return _users[user];
    }

    function _toBind(
        address child,
        address parent,
        uint256 childId,
        uint256 parentId
    ) internal {
        require(childId != parentId, "nft tokenid can not be equal");
        require(child != parent, "address can not be equal");
        _nodes[childId] = Node({account: msg.sender, parentId: parentId});
        // emit BindNFT(child, parent, childId, parentId);
        bytes memory datas = abi.encode(child, parent, childId, parentId);
        eventOut(2, datas);
    }

    function _toMint() internal returns (uint256) {
        //address to, uint256 tokenId
        uint256 tid = _genTokenId();
        // to mint
        _safeMint(msg.sender, tid);
        // user -> token id
        _users[msg.sender] = tid;
        // 发送创建nft事件
        return tid;
    }

    function _genTokenId() internal returns (uint256) {
        _tokenIdTracker = _tokenIdTracker + 1;
        return _tokenIdTracker;
    }

    function _hasMint(address user) internal view returns (bool) {
        return user != address(0) && _users[user] != 0;
    }

    function _levels() internal view returns (uint256) {
        return _ratios.length;
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        require(false, "forbid");
    }
}
