const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const spec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "지역별 맛집 후기 공유 게시판 API",
      version: "8.0.0",
      description: "회원가입, 이메일 인증, 로그인, 게시글 CRUD, 댓글 CRUD 및 인가 검증 API",
    },
    servers: [{ url: "http://localhost:4000" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        PostListItem: {
          type: "object",
          properties: {
            id: { type: "integer" },
            user_id: { type: "integer" },
            region_id: { type: "integer" },
            title: { type: "string" },
            restaurant_name: { type: "string" },
            image_url: { type: "string", nullable: true },
            created_at: { type: "string", format: "date-time" },
            nickname: { type: "string" },
            region_name: { type: "string" },
          },
        },
        PostDetail: {
          allOf: [
            { $ref: "#/components/schemas/PostListItem" },
            {
              type: "object",
              properties: {
                content: { type: "string" },
              },
            },
          ],
        },
        Comment: {
          type: "object",
          properties: {
            id: { type: "integer" },
            post_id: { type: "integer" },
            user_id: { type: "integer" },
            content: { type: "string" },
            created_at: { type: "string", format: "date-time" },
            nickname: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
});

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
}

module.exports = { setupSwagger };
