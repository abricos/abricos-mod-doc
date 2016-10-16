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
            "Link" => "DocLink",
            "LinkList" => "DocLinkList",
            "LinkSave" => "DocLinkSave",
        );
    }

    protected function GetStructures(){
        $ret = 'Owner,Doc,Element,ElementType,ElText,ElPage,ElSection,Link';

        if ($this->IsAdminRole()){
            $ret .= ',DocSave,ElementSave';
        }

        return $ret;
    }

    public function ResponseToJSON($d){
        switch ($d->do){
            case 'docList':
                return $this->DocListToJSON();
            case "docSave":
                return $this->DocSaveToJSON($d->data);
            case 'doc':
                return $this->DocToJSON($d->docid);
            case 'docRemove':
                return $this->DocRemoveToJSON($d->docid);
            case 'elementTypeList':
                return $this->ElementTypeListToJSON();
            case 'docStructure':
                return $this->docStructureToJSON($d->docid);
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

            $this->$elSaveMethod($ret);
        } else {
            $ret->AddCode(DocElementSave::CODE_NOT_CHANGED);
        }

        $ret->AddCode(DocElementSave::CODE_OK);

        if (isset($vars->childs) && is_array($vars->childs)){
            $this->ElementListSave($dSave, $ret->elementid, $vars->childs);
        }

        return $ret;
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
     * @return DocElList
     */
    private function ElList($docid, $type){
        $listClassName = DocElement::ListClassName($type);
        $itemClassName = DocElement::ItemClassName($type);

        /** @var DocElList $list */
        $list = $this->InstanceClass($listClassName);

        $rows = DocQuery::ElList($this->db, $docid, $type);
        while (($d = $this->db->fetch_array($rows))){
            $list->Add($this->InstanceClass($itemClassName, $d));
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

    private function ElementTypeInstance($name, $template, $model){
        $brick = Brick::$builder->LoadBrickS('doc', $template);

        return $this->InstanceClass('ElementType', array(
            'id' => $name,
            'template' => $brick->content,
            'model' => $model
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
        $list->Add($this->ElementTypeInstance('text', 'elText', 'ElText'));
        $list->Add($this->ElementTypeInstance('page', 'elPage', 'ElPage'));
        $list->Add($this->ElementTypeInstance('section', 'elSection', 'ElSection'));

        $this->SetCache('ElementTypeList', $list);

        return $list;
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

        /** @var DocOwner $owner */
        $owner = $this->InstanceClass('Owner', $owner);

        if (!$this->OwnerAppFunctionExist($owner->module, 'Doc_IsLinkList')){
            return AbricosResponse::ERR_BAD_REQUEST;
        }

        $ownerApp = Abricos::GetApp($owner->module);
        if (!$ownerApp->Doc_IsLinkList($owner)){
            return AbricosResponse::ERR_BAD_REQUEST;
        }

        /** @var DocLinkList $list */
        $list = $this->InstanceClass('LinkList');

        $rows = DocQuery::LinkList($this->db, $owner);
        while (($d = $this->db->fetch_array($rows))){
            $list->Add($this->InstanceClass('Link', $d));
        }

        return $list;
    }

    public function LinkSave(DocOwner $owner, $d, $ord){
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

        for ($i = 0; $i < count($links); $i++){
            $linkSave = $this->LinkSave($owner, $links[$i], $i);
            $ret[] = $linkSave;
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

}
