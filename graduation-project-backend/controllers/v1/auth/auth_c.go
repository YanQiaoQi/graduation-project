package auth

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

var Signin gin.HandlerFunc = func(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"message": "pong",
		},
	})
}

var Signup gin.HandlerFunc = func(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"message": "pong",
		},
	})
}
