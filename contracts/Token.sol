pragma solidity ^0.5.16;

contract Token{

    string public name = "Larva";
    string public symbol = "LRV";
    string public standard = "Larva token v1.0";

    uint256 public totalSupply;
    mapping(address=>uint256) public balanceOf;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    constructor(uint _initialSupply) public
    {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    
    }

    function transfer(address _to, uint256 _value) public returns (bool success)
    {
       require(balanceOf[msg.sender] >= _value);
       balanceOf[msg.sender] -= _value;
       balanceOf[_to] += _value;

       emit Transfer(msg.sender, _to, _value);
       return true;
    }
}