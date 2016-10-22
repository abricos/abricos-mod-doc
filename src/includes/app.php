<?php
/**
 * @package Abricos
 * @subpackage Doc
 * @copyright 2016 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

/**
 * Class DocApp
 *
 * @property DocManager $manager
 */
class DocApp extends AbricosApplication {

    protected function GetClasses(){
        return array(
            "Owner" => "DocOwner",
            "Doc" => "Doc",
            "DocList" => "DocList",
            "DocSave" => "DocSave",
            "Element" => "DocElement",
            "ElementList" => "DocElementList",
            "ElementSave" => "DocElementSave",
            "ElementType" => "DocElementType",
            "ElementTypeList" => "DocElementTypeList",
            "ElText" => "DocElText",
            "ElTextList" => "DocElTextList",
            "ElPage" => "DocElPage",
            "ElPageList" => "DocElPageList",
            "ElSection" => "DocElSection",
            "ElSectionList" => "DocElSectionList",
            "ElRow" => "DocElRow",
            "ElRowList" => "DocElRowList",
            "ElCol" => "DocElCol",
            "ElColList" => "DocElColList",
            "ElColSave" => "DocElColSave",
            "ElImage" => "DocElImage",
            "ElImageList" => "DocElImageList",
            "ElImageSave" => "DocElImageSave",
            "ElTable" => "DocElTable",
            "ElTableList" => "DocElTableList",
            "ElTableSave" => "DocElTableSave",
            "ElTableCell" => "DocElTableCell",
            "ElTableCellList" => "DocElTableCellList",
            "ElTableCellSave" => "DocElTableCellSave",
            "Link" => "DocLink",
            "LinkList" => "DocLinkList",
            "LinkSave" => "DocLinkSave",
        );
    }

    protected function GetStructures(){
        $ret = 'Owner,Doc,Element,ElementType,Link,'.
            'ElText,ElPage,ElSection,ElRow,ElCol,ElImage,ElTable,ElTableCell';

        if ($this->IsAdminRole()){
            $ret .= ',DocSave,ElementSave,ElColSave,ElImageSave,ElTableSave,ElTableCellSave';
        }

        return $ret;
    }

    public function ResponseToJSON($d){
        switch ($d->do){
            case 'docList':
                return $this->DocListToJSON();
            case "docSave":
                return $this->DocSaveToJSON($d->data);
            case "docListSort":
                return $this->DocListSortToJSON($d->orders);
            case 'doc':
                return $this->DocToJSON($d->docid);
            case 'docRemove':
                return $this->DocRemoveToJSON($d->docid);
            case 'elementTypeList':
                return $this->ElementTypeListToJSON();
            case 'docStructure':
                return $this->DocStructureToJSON($d->docid);
            case 'linkList':
                return $this->LinkListToJSON($d->owner);
        }
        return null;
    }

    public function IsAdminRole(){
        return $this->manager->IsAdminRole();
    }

    public function IsWriteRole(){
        return $this->manager->IsWriteRole();
    }

    public function IsViewRole(){
        return $this->manager->IsViewRole();
    }

    private function OwnerAppFunctionExist($module, $fn){
        $ownerApp = Abricos::GetApp($module);
        if (empty($ownerApp)){
            return false;
        }
        if (!method_exists($ownerApp, $fn)){
            return false;
        }
        return true;
    }

    public function DocListToJSON(){
        $ret = $this->DocList();
        return $this->ResultToJSON('docList', $ret);
    }

    /**
     * @return DocList|int
     */
    public function DocList(){
        if (!$this->IsViewRole()){
            return AbricosResponse::ERR_FORBIDDEN;
        }

        /** @var DocList $list */
        $list = $this->InstanceClass('DocList');

        $rows = DocQuery::DocList($this->db);
        while (($d = $this->db->fetch_array($rows))){
            $list->Add($this->InstanceClass('Doc', $d));
        }

        return $list;
    }

    public function DocListSortToJSON($orders){
        $ret = $this->DocListSort($orders);
        return $this->ImplodeJSON(array(
            $this->ResultToJSON('docListSort', $ret),
            $this->DocListToJSON()
        ));
    }

    public function DocListSort($orders){
        if (!$this->IsAdminRole()){
            return AbricosResponse::ERR_FORBIDDEN;
        }

        for ($i = 0; $i < count($orders); $i++){
            DocQuery::DocListSort($this->db, $orders[$i]->docid, $orders[$i]->ord);
        }

        $ret = new stdClass();
        $ret->orders = $orders;
        return $ret;
    }

    public function DocSaveToJSON($d){
        $ret = $this->DocSave($d);
        return $this->ResultToJSON('docSave', $ret);
    }

    public function DocSave($d){
        /** @var DocSave $ret */
        $ret = $this->InstanceClass('DocSave', $d);

        if (!$this->IsAdminRole()){
            return $ret->SetError(AbricosResponse::ERR_FORBIDDEN);
        }

        $vars = $ret->vars;

        if (empty($vars->title)){
            return $ret->SetError(
                AbricosResponse::ERR_BAD_REQUEST,
                DocSave::CODE_EMPTY_TITLE
            );
        }

        if ($ret->vars->docid === 0){
            $ret->docid = DocQuery::DocAppend($this->db, $ret);
        } else {
            $ret->docid = $vars->docid;
            DocQuery::DocUpdate($this->db, $ret);
        }

        $ret->AddCode(DocSave::CODE_OK);

        if (isset($vars->childs) && is_array($vars->childs)){
            $this->ElementListSave($ret, 0, $vars->childs);
        }

        $doc = $this->Doc($ret->docid);

        if ($this->db->error && Abricos::$config['Misc']['develop_mode']){
            print_r($this->db->errorText);
        }

        $count = $doc->elementList->Count();
        for ($i = 0; $i < $count; $i++){
            $element = $doc->elementList->GetByIndex($i);
            if (!$ret->IsElementResult($element->id)){ // элемент был удален
                $this->ElementRemove($doc, $element->id);
            }
        }

        $this->CacheClear();

        return $ret;
    }

    private function ElementListSave(DocSave $dSave, $parentid, $childs){
        for ($i = 0; $i < count($childs); $i++){
            $d = $childs[$i];
            $elSave = $this->ElementSave($dSave, $parentid, $i, $d);
            $dSave->AddElementResult($elSave);
        }
    }

    private function ElementSave(DocSave $dSave, $parentid, $ord, $d){
        /** @var DocElementSave $ret */
        $ret = $this->InstanceClass('ElementSave', $d);

        $vars = $ret->vars;

        $elSaveMethod = 'El'.ucfirst($vars->type).'Save';
        if (!method_exists($this, $elSaveMethod)){
            return $ret->SetError(AbricosResponse::ERR_BAD_REQUEST);
        }

        $ret->elementid = $vars->elementid;
        $ret->clientid = $vars->clientid;
        $ret->parentid = $parentid;
        $ret->ord = $ord;

        if ($vars->changed){
            if ($vars->elementid === 0){
                $ret->elementid = DocQuery::ElementAppend($this->db, $dSave, $parentid, $ord, $ret);
            } else {
                DocQuery::ElementUpdate($this->db, $dSave, $ord, $ret);
            }

            $ret->elResult = $this->$elSaveMethod($ret);
        } else {
            $ret->AddCode(DocElementSave::CODE_NOT_CHANGED);
        }

        $ret->AddCode(DocElementSave::CODE_OK);

        if (isset($vars->childs) && is_array($vars->childs)){
            $this->ElementListSave($dSave, $ret->elementid, $vars->childs);
        }

        return $ret;
    }

    private function ElTextSave(DocElementSave $es){
        $utm = Abricos::TextParser();
        $d = $es->vars->el;
        $d->body = $utm->Parser($d->body);

        DocQuery::ElTextUpdate($this->db, $es, $d);
    }

    private function ElPageSave(DocElementSave $es){
        $utmf = Abricos::TextParser(true);
        $d = $es->vars->el;
        $d->title = $utmf->Parser($d->title);

        DocQuery::ElPageUpdate($this->db, $es, $d);
    }

    private function ElSectionSave(DocElementSave $es){
        $utmf = Abricos::TextParser(true);
        $d = $es->vars->el;
        $d->title = $utmf->Parser($d->title);

        DocQuery::ElSectionUpdate($this->db, $es, $d);
    }

    private function ElRowSave(DocElementSave $es){
        $d = $es->vars->el;

        DocQuery::ElRowUpdate($this->db, $es, $d);
    }
    
    private function ElColSave(DocElementSave $es){
        /** @var DocElColSave $ret */
        $ret = $this->InstanceClass('ElColSave', $es->vars->el);

        DocQuery::ElColUpdate($this->db, $es, $ret);
    }

    private function ElImageSave(DocElementSave $es){
        /** @var DocElImageSave $ret */
        $ret = $this->InstanceClass('ElImageSave', $es->vars->el);

        DocQuery::ElImageUpdate($this->db, $es, $ret);

        DocQuery::ImageRemoveFromBuffer($this->db, $ret->vars->filehash);
    }

    private function ElTableSave(DocElementSave $es){
        /** @var DocElTableSave $ret */
        $ret = $this->InstanceClass('ElTableSave', $es->vars->el);

        $vars = $ret->vars;
        $ret->elementid = $es->elementid;
        $vars->rowCount = max($vars->rowCount, 1);
        $vars->colCount = max($vars->colCount, 1);

        DocQuery::ElTableUpdate($this->db, $es, $ret);

        $utm = Abricos::TextParser();
        $utmf = Abricos::TextParser(true);

        $currCellList = $this->ElTableCellList($es->elementid);

        $cells = $vars->cells;
        $map = array();

        for ($i = 0; $i < count($cells); $i++){
            /** @var DocElTableCellSave $cs */
            $cs = $this->InstanceClass('ElTableCellSave', $cells[$i]);
            $cs->cellid = $cs->vars->cellid;
            $cs->clientid = $cs->vars->clientid;

            switch ($cs->vars->type){
                case 'simple':
                    $cs->vars->body = $utmf->Parser($cs->vars->body);
                    break;
                case 'visual':
                    $cs->vars->body = $utm->Parser($cs->vars->body);
                    break;
                default:
                    continue;
                    break;
            }

            if ($cs->vars->cellid === 0){
                $cs->cellid = DocQuery::ElTableCellAppend($this->db, $ret, $cs);
            } else {
                DocQuery::ElTableCellUpdate($this->db, $ret, $cs);
            }

            $ret->cellResults[] = $cs;
            $map[$cs->cellid] = $cs;
        }

        for ($i = 0; $i < $currCellList->Count(); $i++){
            $cell = $currCellList->GetByIndex($i);

            if (!isset($map[$cell->id])){
                DocQuery::ElTableCellRemove($this->db, $ret->elementid, $cell->id);
            }
        }
        return $ret;
    }

    /**
     * @param $elementid
     * @return DocElTableCellList
     */
    private function ElTableCellList($elementid){
        /** @var DocElTableCellList $list */
        $list = $this->InstanceClass('ElTableCellList');

        $rows = DocQuery::ElTableCellList($this->db, $elementid);
        while (($d = $this->db->fetch_array($rows))){
            $list->Add($this->InstanceClass('ElTableCell', $d));
        }
        return $list;
    }

    private function ElementRemove(Doc $doc, $elementid){
        $count = $doc->elementList->Count();
        for ($i = 0; $i < $count; $i++){
            $element = $doc->elementList->GetByIndex($i);
            if ($element->parentid === $elementid){
                $this->ElementRemove($doc, $element->id);
            }
        }

        $element = $doc->elementList->Get($elementid);
        DocQuery::ElementRemove($this->db, $doc->id, $element->id);
        DocQuery::ElRemove($this->db, $element->id, $element->type);
    }

    public function DocToJSON($docid){
        $ret = $this->Doc($docid);
        return $this->ResultToJSON('doc', $ret);
    }

    public function Doc($docid){
        if (!$this->IsViewRole()){
            return AbricosResponse::ERR_FORBIDDEN;
        }
        if ($this->CacheExists('Doc', $docid)){
            return $this->Cache('Doc', $docid);
        }

        $docid = intval($docid);

        $d = DocQuery::Doc($this->db, $docid);
        if (empty($d)){
            return AbricosResponse::ERR_NOT_FOUND;
        }

        /** @var Doc $doc */
        $doc = $this->InstanceClass('Doc', $d);

        $rows = DocQuery::ElementList($this->db, $doc->id);
        while (($d = $this->db->fetch_array($rows))){
            /** @var DocElement $element */
            $element = $this->InstanceClass('Element', $d);
            $doc->elementList->Add($element);

            if (!isset($doc->extends[$element->type])){
                $doc->extends[$element->type] = $this->ElList($doc->id, $element->type);
            }
        }

        $this->SetCache('Doc', $docid, $doc);

        return $doc;
    }

    /**
     * @param $docid
     * @param $type
     * @param null|array $elids
     * @return DocElList
     */
    private function ElList($docid, $type, $elids = null){
        $listClassName = DocElement::ListClassName($type);
        $itemClassName = DocElement::ItemClassName($type);

        /** @var DocElList $list */
        $list = $this->InstanceClass($listClassName);

        $rows = DocQuery::ElList($this->db, $docid, $type, $elids);
        while (($d = $this->db->fetch_array($rows))){
            $list->Add($this->InstanceClass($itemClassName, $d));
        }

        if ($type === 'table'){
            /** @var DocElTableList $list */

            for ($i = 0; $i < $list->Count(); $i++){
                $elTable = $list->GetByIndex($i);
                $elTable->cellList = $this->ElTableCellList($elTable->id);
            }
        }
        return $list;
    }

    public function DocRemoveToJSON($docid){
        $ret = $this->DocRemove($docid);
        return $this->ResultToJSON('docRemove', $ret);
    }

    public function DocRemove($docid){
        if (!$this->IsAdminRole()){
            return AbricosResponse::ERR_FORBIDDEN;
        }

        DocQuery::DocRemove($this->db, $docid);

        $this->CacheClear();

        $ret = new stdClass();
        $ret->docid = $docid;
        return $ret;
    }

    private function ElementTypeInstance($name){
        return $this->InstanceClass('ElementType', array(
            'id' => $name
        ));
    }

    public function ElementTypeListToJSON(){
        $ret = $this->ElementTypeList();
        return $this->ResultToJSON('elementTypeList', $ret);
    }

    /**
     * @return DocElementTypeList|int
     */
    public function ElementTypeList(){
        if (!$this->IsViewRole()){
            return AbricosResponse::ERR_FORBIDDEN;
        }

        if ($this->CacheExists('ElementTypeList')){
            return $this->Cache('ElementTypeList');
        }

        /** @var DocElementTypeList $list */
        $list = $this->InstanceClass('ElementTypeList');
        $list->Add($this->ElementTypeInstance('text'));
        $list->Add($this->ElementTypeInstance('page'));
        $list->Add($this->ElementTypeInstance('section'));
        $list->Add($this->ElementTypeInstance('row'));
        $list->Add($this->ElementTypeInstance('col'));
        $list->Add($this->ElementTypeInstance('image'));
        $list->Add($this->ElementTypeInstance('table'));

        $this->SetCache('ElementTypeList', $list);

        return $list;
    }

    public function DocStructureToJSON($docid){
        $ret = $this->DocStructure($docid);
        return $this->ResultToJSON('docStructure', $ret);
    }

    public function DocStructure($docid){
        if (!$this->IsViewRole()){
            return AbricosResponse::ERR_FORBIDDEN;
        }

        /** @var DocElementList $list */
        $list = $this->InstanceClass('ElementList');

        $rows = DocQuery::ElementList($this->db, $docid);
        while (($d = $this->db->fetch_array($rows))){
            /** @var DocElement $element */
            $element = $this->InstanceClass('Element', $d);
            $list->Add($element);
        }

        return $list;
    }

    public function LinkListToJSON($owner){
        $ret = $this->LinkList($owner);
        return $this->ResultToJSON('linkList', $ret);
    }

    public function LinkList($owner){
        if (!$this->IsViewRole()){
            return AbricosResponse::ERR_FORBIDDEN;
        }

        if (!($owner instanceof DocOwner)){
            /** @var DocOwner $owner */
            $owner = $this->InstanceClass('Owner', $owner);
        }

        if (!$this->OwnerAppFunctionExist($owner->module, 'Doc_IsLinkList')){
            return AbricosResponse::ERR_BAD_REQUEST;
        }

        $ownerApp = Abricos::GetApp($owner->module);
        if (!$ownerApp->Doc_IsLinkList($owner)){
            return AbricosResponse::ERR_BAD_REQUEST;
        }

        /** @var DocLinkList $list */
        $list = $this->InstanceClass('LinkList');

        $extends = array();

        $rows = DocQuery::LinkList($this->db, $owner);
        while (($d = $this->db->fetch_array($rows))){
            /** @var DocLink $link */
            $link = $this->InstanceClass('Link', $d);
            $list->Add($link);

            if (!isset($extends[$link->docid])){
                $extends[$link->docid] = array();
            }
            if (!isset($extends[$link->docid][$link->elType])){
                $extends[$link->docid][$link->elType] = array();
            }
            $extends[$link->docid][$link->elType][] = $link->elementid;
        }

        foreach ($extends as $docid => $types){
            foreach ($types as $type => $elids){
                $elList = $this->ElList($docid, $type, $elids);

                for ($i = 0; $i < $elList->Count(); $i++){
                    $el = $elList->GetByIndex($i);
                    $link = $list->GetBy('elementid', $el->id);
                    $link->el = $el;
                }
            }
        }

        return $list;
    }

    public function LinkSave(DocOwner $owner, $d){
        /** @var DocLinkSave $ret */
        $ret = $this->InstanceClass('LinkSave', $d);
        $vars = $ret->vars;

        $ret->docid = $vars->docid;
        $ret->clientid = $vars->clientid;
        $ret->elementid = $vars->elementid;

        $doc = $this->Doc($vars->docid);

        if (AbricosResponse::IsError($doc)){
            return $ret->SetError(AbricosResponse::ERR_BAD_REQUEST);
        }
        $ret->docTitle = $doc->title;
        $linkPath = array();

        $elementList = $doc->elementList;
        $path = $elementList->GetPath($vars->elementid);
        for ($i = 0; $i < count($path); $i++){
            $element = $elementList->Get($path[$i]);
            $item = new stdClass();
            $item->id = $element->id;
            $item->title = $element->title;
            $linkPath[] = $item;
        }

        $ret->path = $linkPath;
        $ret->linkid = $vars->linkid;

        if ($vars->linkid === 0){
            $ret->linkid = DocQuery::LinkAppend($this->db, $owner, $ret);
        } else {
            DocQuery::LinkUpdate($this->db, $owner, $ret);
        }

        return $ret;
    }

    public function LinkListSave(DocOwner $owner, $links){
        if (!is_array($links)){
            return AbricosResponse::ERR_BAD_REQUEST;
        }

        $currentList = $this->LinkList($owner);

        $ret = array();
        $map = array();

        for ($i = 0; $i < count($links); $i++){
            $linkSave = $this->LinkSave($owner, $links[$i], $i);
            $ret[] = $linkSave;
            $map[$linkSave->linkid] = $linkSave;
        }

        for ($i = 0; $i < $currentList->Count(); $i++){
            $link = $currentList->GetByIndex($i);

            if (!isset($map[$link->id])){
                DocQuery::LinkRemove($this->db, $owner, $link->id);
            }
        }

        return $ret;
    }

    public function Owner($module, $type, $ownerid){
        /** @var DocOwner $owner */
        $owner = $this->InstanceClass('Owner');
        $owner->module = $module;
        $owner->type = $type;
        $owner->ownerid = $ownerid;

        return $owner;
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * */
    /*                      Image Buffer                   */
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * */

    public function ImageAddToBuffer($filehash){
        if (!$this->IsAdminRole()){
            return false;
        }

        DocQuery::ImageAddToBuffer($this->db, $filehash);

        $this->ImageBufferClear();
    }

    public function ImageBufferClear(){
        /** @var FileManager $fm */
        $fm = Abricos::GetModuleManager('filemanager');
        if (empty($fm)){
            return;
        }
        $fm->RolesDisable();

        $rows = DocQuery::ImageFreeFromBufferList($this->db);
        while (($row = $this->db->fetch_array($rows))){
            $fm->FileRemove($row['fh']);
        }
        $fm->RolesEnable();

        DocQuery::ImageFreeListClear($this->db);
    }


}
