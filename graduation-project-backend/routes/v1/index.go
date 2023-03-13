package v1

import (
	// "fmt"

	"github.com/gin-gonic/gin"
)

func InitRoutes(server *gin.Engine) {
	v1 := server.Group("/v1")
	SetAuthRoutes(v1)
}
