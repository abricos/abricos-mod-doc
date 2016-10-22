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
            miniTitle VARCHAR(50) NOT NULL DEFAULT '' COMMENT '',
            
            result TEXT NOT NULL COMMENT '',
            
            dateline INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Дата создания',
            upddate INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Дата обновления',
            deldate INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Дата удаления',
            
            ord INT(5) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
            
            PRIMARY KEY (docid),
            KEY deldate (deldate)
        )".$charset
    );

    $db->query_write("
        CREATE TABLE IF NOT EXISTS ".$pfx."doc_element (
            elementid INT(10) UNSIGNED NOT NULL auto_increment COMMENT '',
            parentid INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
            
            title VARCHAR(50) NOT NULL DEFAULT '' COMMENT '',
            isAutoTitle TINYINT(1) UNSIGNED NOT NULL DEFAULT 1 COMMENT '',
            
            docid INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
            
            elementType VARCHAR(25) NOT NULL DEFAULT '' COMMENT '',
            
            ord INT(5) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
            
            PRIMARY KEY (elementid),
            KEY docid (docid)
        )".$charset
    );

    $db->query_write("
        CREATE TABLE IF NOT EXISTS ".$pfx."doc_el_text (
            elementid INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
            
            body TEXT NOT NULL COMMENT '',
            
            UNIQUE KEY (elementid)
        )".$charset
    );

    $db->query_write("
        CREATE TABLE IF NOT EXISTS ".$pfx."doc_el_page (
            elementid INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
            
            title VARCHAR(255) NOT NULL DEFAULT '' COMMENT '',
            
            UNIQUE KEY (elementid)
        )".$charset
    );

    $db->query_write("
        CREATE TABLE IF NOT EXISTS ".$pfx."doc_el_section (
            elementid INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
            
            title VARCHAR(255) NOT NULL DEFAULT '' COMMENT '',
            
            UNIQUE KEY (elementid)
        )".$charset
    );

    $db->query_write("
        CREATE TABLE IF NOT EXISTS ".$pfx."doc_link (
            linkid INT(10) UNSIGNED NOT NULL auto_increment COMMENT '',
            
            ownerModule VARCHAR(32) NOT NULL DEFAULT '' COMMENT '',
            ownerType VARCHAR(32) NOT NULL DEFAULT '' COMMENT '',
            ownerid INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',

            elementid INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',

            pathCache TEXT NOT NULL COMMENT '',

            ord INT(5) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
            
            PRIMARY KEY (linkid),
            KEY link (ownerModule, ownerType, ownerid, elementid)
        )".$charset
    );
}

if ($updateManager->isUpdate('0.1.1') && !$updateManager->isInstall()){
    $db->query_write("
        ALTER TABLE  ".$pfx."doc
        ADD ord INT(5) UNSIGNED NOT NULL DEFAULT 0 COMMENT ''
    ");
}

if ($updateManager->isUpdate('0.1.1')){
    $db->query_write("
        CREATE TABLE IF NOT EXISTS ".$pfx."doc_el_table (
            elementid INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
            
            isCaption TINYINT(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
            isBorder TINYINT(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
            isHover TINYINT(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
            isCondense TINYINT(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',

            rowCount INT(3) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
            colCount INT(3) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',

            UNIQUE KEY elementid (elementid)
        )".$charset
    );

    $db->query_write("
        CREATE TABLE IF NOT EXISTS ".$pfx."doc_el_tableCell (
            cellid INT(10) UNSIGNED NOT NULL auto_increment COMMENT '',
            elementid INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
            
            cellType ENUM('simple', 'html', 'visual', 'container') DEFAULT 'simple' COMMENT '',
            
            row INT(3) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
            col INT(3) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
            
            body TEXT NOT NULL COMMENT '',
            
            PRIMARY KEY (cellid),
            KEY elementid (elementid)
        )".$charset
    );
}

if ($updateManager->isUpdate('0.1.2')){
    $db->query_write("
        CREATE TABLE IF NOT EXISTS ".$pfx."doc_el_row (
            elementid INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',

            UNIQUE KEY elementid (elementid)
        )".$charset
    );

    $db->query_write("
        CREATE TABLE IF NOT EXISTS ".$pfx."doc_el_col (
            elementid INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',

            xs INT(2) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
            xsOffset INT(2) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',

            sm INT(2) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
            smOffset INT(2) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',

            md INT(2) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
            mdOffset INT(2) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',

            lg INT(2) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
            lgOffset INT(2) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',

            UNIQUE KEY elementid (elementid)
        )".$charset
    );

    $db->query_write("
        CREATE TABLE IF NOT EXISTS ".$pfx."doc_el_image (
            elementid INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',

            filehash VARCHAR(8) NOT NULL DEFAULT '' COMMENT '',

            title VARCHAR(255) NOT NULL DEFAULT '' COMMENT '',
            isResponsive TINYINT(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
            shape ENUM('none', 'rounded', 'circle', 'thumb') DEFAULT 'none' COMMENT '',
            
            width INT(5) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',
            height INT(5) UNSIGNED NOT NULL DEFAULT 0 COMMENT '',

            UNIQUE KEY elementid (elementid)
        )".$charset
    );

    // картинки
    $db->query_write("
		CREATE TABLE IF NOT EXISTS ".$pfx."doc_imageBuffer (
			imageid int(10) UNSIGNED NOT NULL auto_increment,
			filehash VARCHAR(8) NOT NULL,
			dateline int(10) UNSIGNED NOT NULL default '0' COMMENT '',
			PRIMARY KEY (imageid)
		)".$charset
    );

}