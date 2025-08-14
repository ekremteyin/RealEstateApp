using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RealEstate.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPhotoConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ImageUrl",
                table: "Photos",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_Photos_RealEstateId",
                table: "Photos",
                column: "RealEstateId");

            migrationBuilder.AddForeignKey(
                name: "FK_Photos_Estates_RealEstateId",
                table: "Photos",
                column: "RealEstateId",
                principalTable: "Estates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Photos_Estates_RealEstateId",
                table: "Photos");

            migrationBuilder.DropIndex(
                name: "IX_Photos_RealEstateId",
                table: "Photos");

            migrationBuilder.AlterColumn<string>(
                name: "ImageUrl",
                table: "Photos",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);
        }
    }
}
