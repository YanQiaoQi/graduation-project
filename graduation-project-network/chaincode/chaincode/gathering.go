package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-protos-go/peer"
)

// all of the data structure lists

type Line struct {
	User_id  string   `json:"user_id"`
	Time     string   `json:"time"`
	Contents []string `json:"contents"`
}

//Empty allowed: Contents

type Lines struct {
	User_id string `json:"user_id"`
	Lines   []Line `json:"lines"`
}

//Empty  allowed:Lines

type Detail struct {
	Gathering_id string   `json:"gathering_id"`
	Head         []string `json:"head"`
	Type         []string `json:"type"`
}

type Gathering struct {
	Id          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Creator     string `json:"creator"`
	TimeForm    string `json:"time_form"`
	TimeTo      string `json:"time_to"`
	Len         int    `json:"len"`
}

//Empty allowed: TimeTo

type Chaincode struct {
}

func (t *Chaincode) Init(stub shim.ChaincodeStubInterface) peer.Response {
	fmt.Println(" ==== Init ====")

	return shim.Success(nil)
}

func (t *Chaincode) Invoke(stub shim.ChaincodeStubInterface) peer.Response {
	// 获取用户意图
	fun, args := stub.GetFunctionAndParameters()

	if fun == "TestAdd" {
		return t.TestAdd(stub, args)
	} else if fun == "TestQueryByName" {
		return t.TestQueryByName(stub, args)
	} else if fun == "UpdateByInfo" {
		return t.UpdateByInfo(stub, args)
	} else if fun == "DataQuery" {
		return t.DataQuery(stub, args)
	} else if fun == "ListAllDataByNull" {
		return t.ListAllDataByNull(stub, args)
	}
	return shim.Error("指定的函数名称错误")
}

type Test struct {
	Name   string `json:"Name"`   // 姓名
	Gender string `json:"Gender"` // 性别
	Age    string `json:"Age"`    // age
}

func (t *Chaincode) TestAdd(stub shim.ChaincodeStubInterface, args []string) peer.Response {
	if len(args) != 1 {
		return shim.Error("给定的参数个数不符合要求")
	}
	var tData Test
	err := json.Unmarshal([]byte(args[0]), &tData)
	if err != nil {
		return shim.Error("反序列化信息时发生错误")
	}

	_, bl := TestPut(stub, tData)
	if !bl {
		return shim.Error("保存信息时发生错误")
	}

	// err = stub.SetEvent(args[1], []byte{})
	// if err != nil {
	// 	return shim.Error(err.Error())
	// }

	return shim.Success([]byte("信息添加成功"))
}

func TestPut(stub shim.ChaincodeStubInterface, td Test) ([]byte, bool) {

	b, err := json.Marshal(td)
	if err != nil {
		return nil, false
	}

	fmt.Println(td.Name)

	// 保存edu状态
	err = stub.PutState(td.Name, b)
	if err != nil {
		return nil, false
	}

	return b, true
}

func TestFindByName(stub shim.ChaincodeStubInterface, name string) (Test, bool) {
	var td Test
	// 根据身份证号码查询信息状态
	b, err := stub.GetState(name)
	if err != nil {
		return td, false
	}

	if b == nil {
		return td, false
	}

	// 对查询到的状态进行反序列化
	err = json.Unmarshal(b, &td)
	if err != nil {
		return td, false
	}

	// 返回结果
	return td, true
}

func (t *Chaincode) TestQueryByName(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	if len(args) != 1 {
		return shim.Error("给定的参数个数不符合要求")
	}
	Name := args[0]

	// 拼装CouchDB所需要的查询字符串(是getValueByIdQuery标准的一个JSON串)
	// queryString := fmt.Sprintf("{\"selector\":{\"docType\":\"eduObj\", \"CertNo\":\"%s\"}}", CertNo)
	queryString := fmt.Sprintf("{\"selector\":{\"Name\":\"%s\"}}", Name)

	// 查询数据
	result, err := getEduByQueryString(stub, queryString)
	if err != nil {
		return shim.Error("Query Error")
	}
	if result == nil {
		return shim.Error("No Infor")
	}
	return shim.Success(result)
}

func getEduByQueryString(stub shim.ChaincodeStubInterface, queryString string) ([]byte, error) {

	resultsIterator, err := stub.GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryRecords
	var buffer bytes.Buffer

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten {
			buffer.WriteString(",")
		}

		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		bArrayMemberAlreadyWritten = true
	}

	fmt.Printf("- getQueryResultForQueryString queryResult:\n%s\n", buffer.String())

	return buffer.Bytes(), nil

}

//
//=============================Divider=================================
//

//find information by 1. id 2.datatag datatag used to present whitch data structure to be added, id is the primary key
//string prase rule: arg[0]: id arg[1]:datatag, datatag is one of the three top-level data structure
//top level function
func (t *Chaincode) DataQuery(stub shim.ChaincodeStubInterface, args []string) peer.Response {
	if len(args) != 2 {
		return shim.Error("invalid data parameter number")
	}
	if args[1] == "gathering" {
		gatheringString, err := getValueById(stub, args[0])
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success(gatheringString)
	} else if args[1] == "detail" {
		detailString, err := getValueById(stub, args[0])
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success(detailString)
	} else if args[1] == "lines" {
		linesString, err := getValueById(stub, args[0])
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success(linesString)
	}
	return shim.Error("paramters in args ")
}

func (t *Chaincode) DataDBQuery(stub shim.ChaincodeStubInterface, args []string) peer.Response {

	if len(args) != 2 {
		return shim.Error("invalid data parameter number")
	}
	if args[1] == "gathering" {
		queryString := fmt.Sprintf("{\"selector\":{\"id\": \"%s\"}}", args[0])

		result, err := getInfoByQuery(stub, queryString)
		if err != nil {
			return shim.Error("Query Error")
		}
		if result == nil {
			return shim.Error("No Infor")
		}
		return shim.Success(result)
	} else if args[1] == "detail" {
		queryString := fmt.Sprintf("{\"selector\":{\"gathering_id\": \"%s\"}}", args[0])

		result, err := getInfoByQuery(stub, queryString)
		if err != nil {
			return shim.Error("Query Error")
		}
		if result == nil {
			return shim.Error("No Infor")
		}
		return shim.Success(result)
	} else if args[1] == "lines" {
		queryString := fmt.Sprintf("{\"selector\":{\"user_id\": \"%s\"}}", args[0])

		result, err := getInfoByQuery(stub, queryString)
		if err != nil {
			return shim.Error("Query Error")
		}
		if result == nil {
			return shim.Error("No Infor")
		}
		return shim.Success(result)
	}
	return shim.Error("paramters in args ")

}

func getInfoByQuery(stub shim.ChaincodeStubInterface, queryString string) ([]byte, error) {

	resultsIterator, err := stub.GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryRecords
	var buffer bytes.Buffer

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten {
			buffer.WriteString(",")
		}

		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		bArrayMemberAlreadyWritten = true
	}

	fmt.Printf("- getQueryResultForQueryString queryResult:\n%s\n", buffer.String())

	return buffer.Bytes(), nil

}

func getValueById(stub shim.ChaincodeStubInterface, id string) ([]byte, error) {
	data, err := stub.GetState(id)
	if data == nil {
		return data, errors.New("data requested is not exitant")
	}
	return data, err
}

//update information by 1. id 2.datatag
func (t *Chaincode) UpdateByInfo(stub shim.ChaincodeStubInterface, args []string) peer.Response {
	if len(args) != 2 {
		return shim.Error("invalid data parameter number")
	}
	if args[1] == "gathering" {
		var gathering Gathering
		err := json.Unmarshal([]byte(args[0]), &gathering)
		if err != nil {
			return shim.Error(err.Error())
		}
		info, err := json.Marshal(gathering)
		if err != nil {
			return shim.Error(err.Error())
		}
		err = stub.PutState(gathering.Id, info)
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success([]byte("information update successfully"))
	} else if args[1] == "detail" {
		detail := Detail{}
		err := json.Unmarshal([]byte(args[0]), &detail)
		if err != nil {
			return shim.Error(err.Error())
		}
		info, err := json.Marshal(detail)
		if err != nil {
			return shim.Error(err.Error())
		}

		err = stub.PutState(detail.Gathering_id, info)
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success([]byte("information update successfully"))
	} else if args[1] == "lines" {
		lines := Lines{}
		err := json.Unmarshal([]byte(args[0]), &lines)
		if err != nil {
			return shim.Error(err.Error())
		}
		info, err := json.Marshal(lines)
		if err != nil {
			return shim.Error(err.Error())
		}

		err = stub.PutState(lines.User_id, info)
		if err != nil {
			return shim.Error(err.Error())
		}
		return shim.Success([]byte("information update successfully"))
	}
	return shim.Error("paramters in args ")
}

func (t *Chaincode) ListAllDataByNull(stub shim.ChaincodeStubInterface, args []string) peer.Response {
	if len(args) != 0 {
		return shim.Error("invalid data paramter number")
	}
	// queryString := "{\"selector\":{\"id\": \"0\"}}"
	queryString := "{\"selector\":{\"id\": {\"$regex\":\"^[0-9]*$\"}}}"
	result, err := getInfoByQuery(stub, queryString)
	if err != nil {
		return shim.Error("Query Error")
	}
	if result == nil {
		return shim.Error("No Infor")
	}
	return shim.Success(result)
}

func main() {
	err := shim.Start(new(Chaincode))
	if err != nil {
		fmt.Printf("启动Chaincode时发生错误: %s", err)
	}
}
