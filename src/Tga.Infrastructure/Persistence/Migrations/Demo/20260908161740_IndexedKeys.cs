using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Tga.Infrastructure.Persistence.Migrations.Demo
{
    /// <inheritdoc />
    public partial class IndexedKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_SupportRequest_Reference",
                table: "SupportRequest",
                column: "Reference",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SupportRequest_UserId",
                table: "SupportRequest",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_SupportRequest_AspNetUsers_UserId",
                table: "SupportRequest",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SupportRequest_AspNetUsers_UserId",
                table: "SupportRequest");

            migrationBuilder.DropIndex(
                name: "IX_SupportRequest_Reference",
                table: "SupportRequest");

            migrationBuilder.DropIndex(
                name: "IX_SupportRequest_UserId",
                table: "SupportRequest");
        }
    }
}
