package main

import (
	// "fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	// 路由
	"routes/v1"
	
	// 中间件
	"middlewares/cors"
)

var server = gin.New()

func init() {
	server.Use(cors.CorsMiddleWare())
	v1.InitRoutes(server)
}

func main() {
	server.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"data": gin.H{
				"message": "pong",
			},
		})
	})
	server.Run()
}
