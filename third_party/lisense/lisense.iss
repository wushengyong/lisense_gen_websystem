; 脚本由 Inno Setup 脚本向导 生成！
; 有关创建 Inno Setup 脚本文件的详细资料请查阅帮助文档！

#define MyAppName = ReadIni(SourcePath + "lisense_info.ini","lisense","lisense_app","");
#define MyAppNameLisense = ReadIni(SourcePath + "lisense_info.ini","lisense","lisense_name","");
#define MyAppVersion = ReadIni(SourcePath + "lisense_info.ini","lisense","lisense_version","");
#define MyAppPublisher = ReadIni(SourcePath + "lisense_info.ini","lisense","lisense_publisher","");
#define MyAppURL = ReadIni(SourcePath + "lisense_info.ini","lisense","lisense_publisher_url","");
#define MyAppMutex = ReadIni(SourcePath + "lisense_info.ini","lisense","lisense_mutex","");
#define MyCompany = ReadIni(SourcePath + "lisense_info.ini","lisense","lisense_company","");

#define EXCLUDE_FILE "exclude.txt"
#define SOURCE_FILE  "include.txt"
;#define BASEDIR       "..\..\bin\release"

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{BEF11C73-04C2-4CB8-B7F6-1BD9E02B1B48}
AppMutex={#MyAppMutex}
AppName={#MyAppNameLisense}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
LicenseFile={#file AddBackslash(SourcePath) + "Lisense.txt"}
DisableProgramGroupPage=yes
Uninstallable=yes
WizardSmallImageFile=images/small_image.bmp
WizardImageFile=images/left_image.bmp
SetupIconFile=images/setup.ico
UninstallDisplayName={#MyAppNameLisense}
UninstallDisplayIcon={app}\uninstall.ico
DefaultGroupName={#MyCompany}
DirExistsWarning=no
DisableDirPage=yes
DefaultDirName={userappdata}\{# AddBackslash(MyCompany)}{# AddBackslash(MyAppName)}lisense
UsePreviousAppDir=no


OutputDir=..\..\public\lisense\
OutputBaseFilename={#OutExeName}
Compression=lzma
SolidCompression=yes

[Languages]
Name: "chinesesimp"; MessagesFile: "compiler:Default.isl"


[Files]
;先加载过滤器
#define EXCLUDES ""
#define SOURCE ""
#define FileHandle
#define FileLine

#sub AddExcludes
  #define FileLine = FileRead(FileHandle);

  #if FileLine != ""
    #if EXCLUDES != ""
      #expr EXCLUDES += "," + FileLine;
    #else
      #expr EXCLUDES = FileLine;
    #endif
  #endif
#endsub

#for {FileHandle = FileOpen(EXCLUDE_FILE); \
  FileHandle && ! FileEof(FileHandle); ""} \
  AddExcludes


;关闭文件句柄
#if FileHandle
#expr FileClose(FileHandle)
#endif

;#define PREFIX_POS
#define DESTDIR

;加载Source目录
#sub AddFile
  #define SOURCE = FileRead(FileHandle);
  #define DESTDIR = SOURCE;
  #define DESTDIR ExtractFilePath(DESTDIR)
  #if EXCLUDES == ""
    Source:"{#BASEDIR}\{#SOURCE}"; DestDir:"{app}\{#DESTDIR}"; Flags: recursesubdirs ignoreversion;
    #pragma message "Add Source : Source :""" + SOURCE + """; DestDir:""" + DESTDIR + """;Flags: recursesubdirs;"
  #else
    Source:"{#BASEDIR}\{#SOURCE}"; DestDir:"{app}\{#DESTDIR}" ; Flags: recursesubdirs ignoreversion; Excludes:"{#EXCLUDES}"
    #pragma message "Add Source : Source :""" + SOURCE + """; DestDir:""" + DESTDIR + """;Flags: recursesubdirs; Excludes: """ + EXCLUDES + """;"
  #endif
#endsub
#for {FileHandle = FileOpen(SOURCE_FILE); \
  FileHandle && ! FileEof(FileHandle); "" } \
  AddFile
;关闭文件句柄
#if FileHandle
#expr FileClose(FileHandle)
#endif

Source:"images/uninstall.ico"; DestDir:"{app}\"; Flags: recursesubdirs ignoreversion;

; 注意: 不要在任何共享系统文件上使用“Flags: ignoreversion”

;注册表启动项 
[Registry] 
Root: HKCU; Subkey: "Software\{#MyCompany}"; Flags: uninsdeletekeyifempty
Root: HKCU; Subkey: "Software\{#MyCompany}\Lisense"; Flags: uninsdeletekeyifempty
Root: HKCU; Subkey: "Software\{#MyCompany}\Lisense\{#MyAppName}"; Flags: uninsdeletekey

Root: HKLM; Subkey: "Software\{#MyCompany}"; Flags: uninsdeletekeyifempty
Root: HKLM; Subkey: "Software\{#MyCompany}\Lisense"; Flags: uninsdeletekeyifempty
Root: HKLM; Subkey: "Software\{#MyCompany}\Lisense\{#MyAppName}"; Flags: uninsdeletekey


Root: HKLM; Subkey: "Software\{#MyCompany}\Lisense\{#MyAppName}"; ValueType: string; ValueName: "Version"; ValueData: "{#MyAppVersion}"
Root: HKLM; Subkey: "Software\{#MyCompany}\Lisense\{#MyAppName}"; ValueType: string; ValueName: "UninstallPath"; ValueData: "{uninstallexe}"
;安装时判断客户端是否正在运行 
   
[Code]
//判断是否已经安装了该程序
function InitializeSetup(): boolean;
var
  UninstallPath : string;
  ErrorCode: Integer;
  bExitCauseNotExist: boolean;
  UninstallStr : string;
  VersionStr : string;
begin
  Result := true
  bExitCauseNotExist := false;
  UninstallStr := '{#MyAppNameLisense} had installed.' #13#13 'Are you sure to uninstall it?';

  while RegValueExists(HKEY_LOCAL_MACHINE,'Software\{#MyCompany}\Lisense\{#MyAppName}','Version') and Result do
  begin
    RegQueryStringValue(HKEY_LOCAL_MACHINE,'Software\{#MyCompany}\Lisense\{#MyAppName}','Version', VersionStr);
    if CompareStr('{#MyAppVersion}',VersionStr) < 0 then
    begin
      UninstallStr := 'A newer version Lisense of {#MyAppName} in this machine is detected.' #13#13 'Are you sure to uninstall it?';
    end
    Result := MsgBox(UninstallStr,mbConfirmation,MB_YESNO) = IDYES;
    if Result then
    begin
       RegQueryStringValue(HKEY_LOCAL_MACHINE,'Software\{#MyCompany}\Lisense\{#MyAppName}','UninstallPath',UninstallPath);
       bExitCauseNotExist := FileExists(UninstallPath) = false;
       if bExitCauseNotExist then
       begin
          break;
       end;
       ShellExec('',UninstallPath,'','',SW_SHOW,ewWaitUntilTerminated,ErrorCode);
    end;
  end;

  if bExitCauseNotExist then
  begin
    Result := MsgBox('Lisense of {#MyAppName} exists but wrong path.' #13#13 'Will you go on installing?',mbConfirmation,MB_YESNO) = IDYES;
  end;
end;





