using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;
using Tga.Application;
namespace Tga.Infrastructure.Storage;
public class DemoDocumentStorageService : IDocumentStorageService {
 readonly string root;
 public DemoDocumentStorageService(IConfiguration config) { root=Path.GetFullPath(config["Storage:Path"]??"data/documents");Directory.CreateDirectory(root); }
 string Resolve(string key) { if(!Guid.TryParseExact(key,"N",out _))throw new ArgumentException("Invalid storage key.");return Path.Combine(root,key); }
 public async Task<StoredDocumentResult> UploadAsync(Stream stream,CancellationToken ct) { var key=Guid.NewGuid().ToString("N");try { await using(var output=new FileStream(Resolve(key),FileMode.CreateNew,FileAccess.Write,FileShare.None,81920,true))await stream.CopyToAsync(output,ct);await using var input=File.OpenRead(Resolve(key));var hash=await SHA256.HashDataAsync(input,ct);return new(key,Convert.ToHexString(hash),input.Length); } catch {File.Delete(Resolve(key));throw;} }
 public Task<Stream> DownloadAsync(string key,CancellationToken ct)=>Task.FromResult<Stream>(File.OpenRead(Resolve(key)));
 public Task DeleteAsync(string key,CancellationToken ct) {File.Delete(Resolve(key));return Task.CompletedTask;}
 public Task<bool> ExistsAsync(string key,CancellationToken ct)=>Task.FromResult(File.Exists(Resolve(key)));
}
// Explicit sandbox no-op. Production startup rejects this provider.
public class DemoFileSecurityScanner : IFileSecurityScanner { public Task<bool> IsCleanAsync(Stream stream,CancellationToken ct)=>Task.FromResult(true); }
