package main

import (
	"encoding/json"
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// 数据结构定义
type Data struct {
	DataHash string //json:"dataHash"
}

// status 1 成功 0 失败
type Result struct {
	status  int    //json:"status"
	message string //json:"message"
	payload string //json:"payload"
}

type UpdateData struct {
	DataHash    string //json:"dataHash"
	NewDataHash string //json:"newDataHash"
}

type SimpleChaincode struct {
}

type QueryResult struct {
	email        string `json:"email"`
	certificates string
}

// 初始化智能合约
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}

// 执行智能合约的操作
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()

	if function == "storeDataHash" {
		return t.storeDataHash(stub, args)
	} else if function == "queryDataHash" {
		return t.queryDataHash(stub, args)
	} else if function == "updateDataHash" {
		return t.updateDataHash(stub, args)
	} else if function == "queryAllDataHash" {
		return t.queryAllDataHash(stub, args)
	}
	return shim.Error("Invalid function name.")
}

func (t *SimpleChaincode) queryDataHash(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	// 查询数据哈希值
	dataBytes, err := stub.GetState(args[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	//if dataBytes == nil {
	//   return shim.Error("No data with key: " + args[0])
	//}

	return shim.Success(dataBytes)
}

func (t *SimpleChaincode) queryAllDataHash(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 0 {
		return shim.Error("Incorrect number of arguments. Expecting 0")
	}

	startKey := ""
	endKey := ""

	// 查询数据哈希值
	resultsIterator, err := stub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}

	//if dataBytes == nil {
	//   return shim.Error("No data with key: " + args[0])
	//}
	defer resultsIterator.Close()
	//定义了查询结果的切片
	rsp := make(map[string]string)
	//查询之后返回迭代器，GetStateByRange里的hasnext()和next()进行循环，实现功能
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()

		if err != nil {
			return shim.Error(err.Error())
		}

		rsp[queryResponse.Key] = string(queryResponse.Value)
	}
	jsonRsp, err := json.Marshal(rsp)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(jsonRsp)
}

func (t *SimpleChaincode) updateDataHash(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	updateData := UpdateData{}
	err := json.Unmarshal([]byte(args[0]), &updateData)
	if err != nil {
		return shim.Error(err.Error())
	}

	// 查询数据哈希值
	dataBytes, err := stub.GetState(updateData.DataHash)
	if err != nil {
		return shim.Error(err.Error())
	}

	if dataBytes == nil {
		return shim.Error("No data with key: " + updateData.DataHash)
	}

	data := Data{}
	err = json.Unmarshal(dataBytes, &data)
	if err != nil {
		return shim.Error(err.Error())
	}

	// 更新数据哈希值
	data.DataHash = updateData.NewDataHash
	dataBytes, err = json.Marshal(data)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = stub.PutState(data.DataHash, dataBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

// 将数据哈希值存储到链上
func (t *SimpleChaincode) storeDataHash(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}
	id := args[0]
	data := args[1]

	dataBytes, err := json.Marshal(data)
	if err != nil {
		return shim.Error(err.Error())
	}

	// 将数据哈希值写入链上
	err = stub.PutState(id, dataBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)

}

// 启动智能合约
func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}
