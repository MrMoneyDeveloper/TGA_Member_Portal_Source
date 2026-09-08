FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /source
COPY src/ ./src/
RUN dotnet restore src/Tga.Api/Tga.Api.csproj
RUN dotnet publish src/Tga.Api/Tga.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
RUN mkdir -p /app/data && chown -R app:app /app/data
USER app
ENV ASPNETCORE_ENVIRONMENT=Sandbox TGA_DATA_MODE=Demo TGA_PAYMENT_MODE=Mock
EXPOSE 8080
ENTRYPOINT ["dotnet", "Tga.Api.dll"]
