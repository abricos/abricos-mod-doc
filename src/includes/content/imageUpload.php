<?php
/**
 * @package Abricos
 * @subpackage Doc
 * @copyright 2016 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

/** @var DocApp $app */
$app = Abricos::GetApp('doc');

if (!$app->IsAdminRole()){
    return;
}

/** @var FileManager $fileManager */
$fileManager = Abricos::GetModuleManager('filemanager');
if (empty($fileManager)){
    return;
}

$brick = Brick::$builder->brick;
$var = &$brick->param->var;

$adress = Abricos::$adress;

if (!isset($adress->dir[2]) || $adress->dir[2] !== "go"){
    return;
}

$uploadFile = $fileManager->CreateUploadByVar('image');
$uploadFile->maxImageWidth = 1600;
$uploadFile->maxImageHeight = 1600;
$uploadFile->ignoreFileSize = true;
$uploadFile->isOnlyImage = true;
$uploadFile->outUserProfile = true;

$error = $uploadFile->Upload();
if (!empty($error)){
    $var['command'] = Brick::ReplaceVarByData($var['error'], array(
        "errnum" => $error
    ));

    $brick->content = Brick::ReplaceVarByData($brick->content, array(
        "fname" => $uploadFile->fileName
    ));
    return;
}

$filehash = $uploadFile->uploadFileHash;
$fInfo = $fileManager->GetFileInfo($filehash);

$var['command'] = Brick::ReplaceVarByData($var['ok'], array(
    "filehash" => $filehash,
    "filename" => $uploadFile->fileName,
    "width" => $fInfo['w'],
    'height' => $fInfo['h']
));

$app->ImageAddToBuffer($filehash);
