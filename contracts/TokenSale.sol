pragma solidity ^0.5.16;

import "./Token.sol";

contract TokenSale{

    address admin;
    Token public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(Token _tokenContract, uint256 _tokenPrice) public{
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function multiply(uint256 x, uint256 y) internal pure returns(uint256 z){
        require(y == 0 || (z = x * y) / y == x);
    }

    function buyTokens(uint256 _tokenNumber) public payable
    {

        require(msg.value == multiply(_tokenNumber, tokenPrice));

        // require that tokens are available
        require(tokenContract.balanceOf(address(this)) >= _tokenNumber);
        require(tokenContract.transfer(msg.sender, _tokenNumber));
        tokensSold += _tokenNumber;

        emit Sell(msg.sender, _tokenNumber);

    }
}