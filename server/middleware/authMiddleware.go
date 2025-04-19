package middleware

import (
	"net/http"
	helper "go-restaurant/helpers"

	"github.com/gin-gonic/gin"
)

// clientToken := c.Request.Header.Get("Token")
func Authentication() gin.HandlerFunc {
	return func(c *gin.Context) {
		clientToken := c.GetHeader("Authorization")
		if clientToken == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "no authorization header provided"})
			c.Abort()
			return
		}

		// Remove Bearer prefix if it exists
		if len(clientToken) > 7 && clientToken[:7] == "Bearer " {
			clientToken = clientToken[7:]
		}

		claims, errMessage := helper.ValidateToken(clientToken)
		if errMessage != "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": errMessage})
			c.Abort()
			return
		}

		c.Set("userID", claims.User_ID)
		c.Set("firstName", claims.First_name)
		c.Set("lastName", claims.Last_name)
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)
		c.Next()
	}
}

// AuthorizeRoles checks if the user has required roles
func AuthorizeRoles(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user role not found"})
			c.Abort()
			return
		}

		roleStr, ok := role.(string)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "role type assertion failed"})
			c.Abort()
			return
		}

		authorized := false
		for _, allowedRole := range allowedRoles {
			if roleStr == allowedRole {
				authorized = true
				break
			}
		}

		if !authorized {
			c.JSON(http.StatusForbidden, gin.H{"error": "you don't have permission to access this resource"})
			c.Abort()
			return
		}

		c.Next()
	}
}