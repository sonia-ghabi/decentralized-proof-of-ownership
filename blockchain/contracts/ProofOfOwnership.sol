pragma solidity ^0.5.0;

contract ProofOfOwnership {
    struct usage {
        string user;
        string encryptedKey;
        uint date;
        bool isValue;
    }
    
    // Definition of a proof of ownership.
    struct proof { 
        string hashing; // The MD5 hash of the image
        string owner; // The owner 
        uint date;  
        bool isValue;
        string ipfsHash; // IPFS hash of the wetrmarked image
        string ipfsHashEncrypted; // IPFS hash of the encrypted image
        string encryptedKey; // The encrypted key used to encrypt the original file
        mapping (string => usage) usageRights;       
    }

    // The map that stores all the proof of ownership.
    mapping (string => proof) proofMap;

    /**
        Save a new proof of ownership.
    */
    function saveProof(
        string memory hashing, 
        string memory owner, 
        string memory ipfsHash, 
        string memory ipfsHashEncrypted, 
        string memory encryptedKey) 
    public  {
        if (proofMap[hashing].isValue)
        {
            revert("The P.O.O. already exist");
        }
        proofMap[hashing] = proof(hashing, owner, now, true, ipfsHash, ipfsHashEncrypted, encryptedKey);
    } 

    /**
        Get a proof of ownership from its hashing.
     */
    function getProof(string memory hashing) public view returns (string memory, uint) {
        if (!proofMap[hashing].isValue)
        {
            revert("The P.O.O. doesn't exist");
        } 
        proof memory p = proofMap[hashing];
        return (p.owner, p.date);
    } 

    /**
        Register usage rights.
    */
    function registerUsageRights(
        string memory hashing, 
        string memory encryptedKey, 
        string memory user) 
    public  {
        if (!proofMap[hashing].isValue)
        {
            revert("The P.O.O. doesn't exist");
        }
        if (proofMap[hashing].usageRights[user].isValue)
        {
            revert("Already register for usage rights");
        }
        proofMap[hashing].usageRights[user] = usage(user, encryptedKey, now, true);
    }
}