// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// import "hardhat/console.sol";

contract PyramidV2 is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdTracker;
    struct Node {
        address from;
        uint256 tokenId;
        uint level;
    }
    /// @notice 最大等级
    uint public _maxLevel;
    /// @notice 分佣权重
    uint256[] public _ratios;
    /// @notice 允许白名单
    bool public _enableWhite;
    /// @dev 节点列表
    mapping(address => Node) private _nodes;
    /// @dev 白名单列表
    mapping(address => mapping(address => bool)) private _whiteList;

    constructor(uint256[] memory ratios, bool enableWhite) {
        _ratios = ratios;
        _maxLevel = ratios.length;
        _enableWhite = enableWhite;
    }

    // 事件:新增节点
    event CreateNode(address from, address to, uint256 tokenId, uint256 level);
    event AddWhite(address from, address to);

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

    /// 允许设置白名单
    /// @param enable enable
    function setEnableWhite(bool enable) public onlyOwner {
        _enableWhite = enable;
    }

    /// 设置一级代理
    /// @param targets 目标地址数组
    function setRoot(address[] memory targets) public onlyOwner {
        for (uint i = 0; i < targets.length; i++) {
            address to = targets[i];
            if (
                to == address(0x0) ||
                to == _msgSender() ||
                to == address(this) ||
                _nodes[to].tokenId != 0
            ) {
                continue;
            }
            uint256 tokenId = _toMint();
            _createNode(address(this), to, tokenId, 1);
        }
    }

    /// 构建节点
    /// @param from_ 前节点
    /// @param to_ 目标节点
    /// @param tokenId_ nft
    /// @param level_ 等级
    function _createNode(
        address from_,
        address to_,
        uint256 tokenId_,
        uint256 level_
    ) private {
        _nodes[to_] = Node({from: from_, tokenId: tokenId_, level: level_});
        emit CreateNode(from_, to_, tokenId_, level_);
    }

    /// 铸造NFT
    ///
    function _toMint() private returns (uint256) {
        _tokenIdTracker.increment();
        uint256 tid = _tokenIdTracker.current();
        // _mint(to, tid);
        return tid;
    }

    /// 设置白名单地址
    /// @param to 目标地址
    function addWhite(address to) public {
        require(_enableWhite, "admin is not allowed to set the whitelist");
        require(_nodes[_msgSender()].tokenId != 0, "target node is exist");
        require(
            _nodes[_msgSender()].level <= _maxLevel,
            "front node level >= maxLevel"
        );
        _whiteList[_msgSender()][to] = true;
        emit AddWhite(_msgSender(), to);
    }

    /// 确认绑定等级关系
    /// @param from 父节点地址
    function confirm(address from) public {
        require(_nodes[_msgSender()].tokenId != 0, "The node already exists");
        require(from != address(0x0), "front node can not be zero");
        require(_nodes[from].tokenId != 0, "front node not exist");
        require(_nodes[from].level < _maxLevel, "level overflow");
        require(
            !_enableWhite || _whiteList[from][_msgSender()],
            "not in white list"
        );
        uint256 tokenId = _toMint();
        uint256 level = _nodes[from].level + 1;
        _createNode(from, _msgSender(), tokenId, level);
    }

    // 查询节点链接关系
    function getRebate(
        address user
    ) public view returns (address[] memory, uint256[] memory) {
        
        address[] memory fronts;
        uint256[] memory ratios;
        if (_nodes[user].tokenId == 0) {
            // 这是一个没有任何关系的素人节点
            fronts[0] = user;
            ratios[0] = 1;
            return (fronts, ratios);
        } else {
            // 非素人节点
            address cursor = user;
            for (uint i = 0; i < _maxLevel; i++) {
                address f = _nodes[cursor].from;
                if (f == address(this)) {
                    break;
                }
                fronts[i] = cursor;
                cursor = f;
            }
            for (uint i = 0; i < fronts.length; i++) {
                ratios[i] = _ratios[fronts.length - i - 1];
            }
        }
        return (fronts, ratios);
    }
}
