DOCS=$(wildcard *.jemdoc)
PHDOCS=$(patsubst %.jemdoc,%.html,$(DOCS))

.PHONY : docs
docs : $(PHDOCS)
%.html : %.jemdoc MENU
	jemdoc -o $@ $<

.PHONY : clean
clean :
	-rm -f *.html
	-rm -r eqs/
