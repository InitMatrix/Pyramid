// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// import "hardhat/console.sol";

contract PyramidV1 is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdTracker;

    struct Node {
        address parent;
        uint256 tokenId;
        uint level;
    }
    /// @notice 最大等级
    uint public _maxLevel;
    /// @notice 分佣权重
    uint256[] public _ratios;

    /// @dev 节点列表
    mapping(address => Node) private _nodes;

    constructor(
        string memory name,
        string memory symbol,
        uint256[] memory ratios
    ) ERC721(name, symbol) {
        _ratios = ratios;
        _maxLevel = ratios.length;
        _setRoot(_msgSender());
    }

    // 事件:新增节点
    event CreateNode(
        address parent,
        address to,
        uint256 tokenId,
        uint256 level
    );

    /// 设置不同级别分成比例
    /// @param newRatios 新分成比例
    function setRatios(uint256[] memory newRatios) public onlyOwner {
        require(
            newRatios.length >= _ratios.length,
            "new ratios length must >= old ratios length"
        );
        _ratios = newRatios;
        _maxLevel = newRatios.length;
    }

    /// 设置根节点
    /// @param targets 目标地址数组
    function setRoot(address[] memory targets) public onlyOwner {
        for (uint i = 0; i < targets.length; i++) {
            address user = targets[i];
            _setRoot(user);
        }
    }

    function _setRoot(address user) internal {
        if (user == address(0x0) || isNode(user)) {
            return;
        }
        uint256 tokenId = _toMint(user);
        _createNode(address(0x0), user, tokenId, 1);
    }

    /// 构建节点
    /// @param parent_ 前节点
    /// @param to_ 目标节点
    /// @param tokenId_ nft
    /// @param level_ 等级
    function _createNode(
        address parent_,
        address to_,
        uint256 tokenId_,
        uint256 level_
    ) private {
        _nodes[to_] = Node({parent: parent_, tokenId: tokenId_, level: level_});
        emit CreateNode(parent_, to_, tokenId_, level_);
    }

    /// 铸造NFT
    /// @param to 目标地址
    function _toMint(address to) private returns (uint256) {
        _tokenIdTracker.increment();
        uint256 tid = _tokenIdTracker.current();
        _mint(to, tid);
        return tid;
    }

    /// 确认绑定等级关系
    /// @param parent 父节点地址
    function bind(address parent) public {
        // console.log("confirm sender tokenid=", _nodes[_msgSender()].tokenId);
        require(parent != address(0x0), "parent node can not be zero");
        require(parent != _msgSender(), "can not bind youself");
        require(isNode(parent), "parent node is not exist");
        require(!isNode(_msgSender()), "You're already bound node");
        require(_nodes[parent].level < _maxLevel, "level overflow");
        uint256 tokenId = _toMint(_msgSender());
        uint256 level = _nodes[parent].level + 1;
        _createNode(parent, _msgSender(), tokenId, level);
    }

    /// 获取目标地址对应的上级地址和权重
    /// @param user 目标地址
    /// @return
    /// @return
    function getRebate(
        address user
    ) public view returns (address[] memory, uint256[] memory) {
        if (!isNode(user)) {
            // console.log("this is not a node", user);
            address[] memory x = new address[](1);
            uint256[] memory y = new uint256[](1);
            x[0] = user;
            y[0] = 0;
            return (x, y);
        }
        if (isRoot(user)) {
            // console.log("this is root node", user);
            address[] memory x = new address[](1);
            uint256[] memory y = new uint256[](1);
            x[0] = user;
            y[0] = 1;
            return (x, y);
        } else {
            // console.log("this is leaf node", user);
            uint256 n = _nodes[user].level;
            // console.log("n=", n);
            address[] memory x = new address[](n);
            uint256[] memory y = new uint256[](n);
            address curos = user;
            for (uint i = 0; i < n; i++) {
                Node memory node = _nodes[curos];
                uint256 m = node.level;
                x[i] = curos;
                y[i] = _ratios[m - 1];
                curos = node.parent;
            }
            return (x, y);
        }
    }

    /// 判断是否为根地址
    /// @param user 目标地址
    function isRoot(address user) public view returns (bool) {
        return _nodes[user].tokenId != 0 && _nodes[user].parent == address(0x0);
    }

    /// 判断是否为节点
    /// @param user 目标地址
    function isNode(address user) public view returns (bool) {
        return _nodes[user].tokenId != 0;
    }

    /// 获取节点信息
    /// @param user 目标地址
    function getNode(address user) public view returns (Node memory) {
        // console.log("hahahah");
        return _nodes[user];
    }

    function parentOf(address user) public view returns (address) {
        return _nodes[user].parent;
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        revert("forbid");
    }
}
