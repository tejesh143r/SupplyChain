const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SecureChainFlow Smart Contract", function () {
  let contract;
  let owner, manufacturer, custodian1, custodian2, aiMonitor;

  beforeEach(async function () {
    [owner, manufacturer, custodian1, custodian2, aiMonitor] = await ethers.getSigners();

    const SecureChainFlow = await ethers.getContractFactory("SecureChainFlow");
    contract = await SecureChainFlow.deploy();
    await contract.waitForDeployment();

    await contract.connect(owner).setAuthorizedMonitor(aiMonitor.address, true);
  });

  it("Should register a product with dynamic category and metadata", async function () {
    const tx = await contract.connect(manufacturer).registerProduct(
      "BioPharma Cold Vaccine",
      "Pharmaceuticals",
      "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"
    );
    await tx.wait();

    const product = await contract.getProduct(1);
    expect(product.productId).to.equal(1);
    expect(product.productName).to.equal("BioPharma Cold Vaccine");
    expect(product.category).to.equal("Pharmaceuticals");
    expect(product.manufacturer).to.equal(manufacturer.address);
    expect(product.currentCustodian).to.equal(manufacturer.address);
    expect(product.currentState).to.equal(0); // State.Created
    expect(product.isFlagged).to.be.false;
  });

  it("Should transfer custody across valid lifecycle states", async function () {
    await contract.connect(manufacturer).registerProduct(
      "UltraSens Thermal Chip",
      "Electronics",
      "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
    );

    await contract.connect(manufacturer).transferCustody(
      1,
      custodian1.address,
      1, // State.Processed
      "Manufacturing batch completed"
    );

    let product = await contract.getProduct(1);
    expect(product.currentCustodian).to.equal(custodian1.address);
    expect(product.currentState).to.equal(1);

    await contract.connect(custodian1).transferCustody(
      1,
      custodian2.address,
      2, // State.InTransit
      "Shipment is underway"
    );

    product = await contract.getProduct(1);
    expect(product.currentCustodian).to.equal(custodian2.address);
    expect(product.currentState).to.equal(2);

    await contract.connect(custodian2).transferCustody(
      1,
      manufacturer.address,
      3, // State.Inspected
      "Inspection passed"
    );

    product = await contract.getProduct(1);
    expect(product.currentCustodian).to.equal(manufacturer.address);
    expect(product.currentState).to.equal(3);

    const history = await contract.getProductHistory(1);
    expect(history.length).to.equal(4); // Created, Processed, InTransit, Inspected
  });

  it("Should reject invalid transitions and unauthorized AI flagging", async function () {
    await contract.connect(manufacturer).registerProduct(
      "Organic Honey Batch #4",
      "Food & Agriculture",
      "QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx"
    );

    await expect(
      contract.connect(manufacturer).transferCustody(1, custodian1.address, 3, "Invalid jump")
    ).to.be.revertedWith("SecureChainFlow: Invalid state transition");

    await expect(
      contract.connect(custodian1).flagAnomalousProduct(1, "Temperature spike detected")
    ).to.be.revertedWith("SecureChainFlow: Unauthorized monitor");
  });

  it("Should allow authorized AI monitor to flag anomalous product", async function () {
    await contract.connect(manufacturer).registerProduct(
      "Cold Chain Vaccine Lot 2",
      "Pharmaceuticals",
      "QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx"
    );

    await contract.connect(aiMonitor).flagAnomalousProduct(
      1,
      "Temperature spike detected: 14.5C (Max threshold: 4C)"
    );

    const product = await contract.getProduct(1);
    expect(product.currentState).to.equal(5); // State.Flagged
    expect(product.isFlagged).to.be.true;
    expect(product.flagReason).to.contain("Temperature spike");

    await expect(
      contract.connect(manufacturer).transferCustody(1, custodian1.address, 2, "Try transfer")
    ).to.be.revertedWith("SecureChainFlow: Cannot transfer flagged product");
  });
});
