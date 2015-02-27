function(doc){
  if(doc.content_type){
    emit([doc.content_type, doc.info ? doc.info.title : doc.name], 1); 
  }
}
