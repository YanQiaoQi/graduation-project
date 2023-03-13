package v1

import (
	"github.com/gin-gonic/gin"

	authControllers "controllers/v1/auth"
)

func SetAuthRoutes(g *gin.RouterGroup) {
	auth := g.Group("/auth")
	{
		auth.POST("/signin", authControllers.Signin)

		auth.POST("/signup", authControllers.Signup)
	}

}
