<?php
/**
 * @package Abricos
 * @subpackage Doc
 * @copyright 2016 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

$charset = "CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'";
$updateManager = Ab_UpdateManager::$current;
$db = Abricos::$db;
$pfx = $db->prefix;

if ($updateManager->isInstall()){
    Abricos::GetModule('doc')->permission->Install();

    $db->query_write("
		CREATE TABLE IF NOT EXISTS ".$pfx."doc (
			docid INT(10) UNSIGNED NOT NULL auto_increment COMMENT '',
			
			userid INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
			
			title VARCHAR(255) NOT NULL DEFAULT '' COMMENT '',
  		    descript TEXT NOT NULL COMMENT '',
			
			dateline INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Дата создания',
			upddate INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Дата обновления',
			deldate INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Дата удаления',

			PRIMARY KEY (docid),
			KEY deldate (deldate)
		)".$charset
    );

    $db->query_write("
		CREATE TABLE IF NOT EXISTS ".$pfx."doc_body (
			bodyid INT(10) UNSIGNED NOT NULL auto_increment COMMENT '',
			docid INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
			parentid INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
			
			prefix VARCHAR(255) NOT NULL DEFAULT '' COMMENT '',
			num INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
			suffix VARCHAR(255) NOT NULL DEFAULT '' COMMENT '',

			title VARCHAR(255) NOT NULL DEFAULT '' COMMENT '',
  		    body TEXT NOT NULL  COMMENT '',
			
			dateline INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Дата создания',
			upddate INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Дата обновления',
			deldate INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Дата удаления',

			PRIMARY KEY (bodyid),
			KEY body (docid, deldate)
		)".$charset
    );

}
